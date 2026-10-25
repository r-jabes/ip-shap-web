import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DemoProduct } from "@/domain/catalogue";
import {
  CartProvider,
  useCart,
  useLiveProduct,
} from "@/components/cart/CartProvider";
import {
  CART_PRODUCTS_STORAGE_KEY,
  CART_STORAGE_KEY,
  snapshotProduct,
} from "@/lib/cart";
import { listProducts } from "@/lib/catalogue";

/** Stands in for the server: answers cart lookups for the given set of sellable products. */
function mockServer(sellable: DemoProduct[]) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.startsWith("/api/cart/products")) {
      const ids = decodeURIComponent(url.split("ids=")[1] ?? "").split(",");
      return new Response(
        JSON.stringify({
          products: sellable
            .filter((product) => ids.includes(product.id))
            .map(snapshotProduct),
        }),
        { status: 200 },
      );
    }
    return new Response(JSON.stringify({ stock: {} }), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** What a product card does: tell the cart about the product it shows. */
function Probe({ product }: { product: DemoProduct }) {
  const { itemCount, items, notice, hydrated, addItem, setQuantity } =
    useCart();
  useLiveProduct(product);
  return (
    <div>
      <p data-testid="hydrated">{String(hydrated)}</p>
      <p data-testid="count">{itemCount}</p>
      <p data-testid="rows">{items.length}</p>
      <p data-testid="notice">{notice ?? ""}</p>
      <button type="button" onClick={() => addItem(product.id, 2)}>
        add
      </button>
      <button type="button" onClick={() => setQuantity(product.id, 500)}>
        max
      </button>
    </div>
  );
}

async function hydrated() {
  await waitFor(() =>
    expect(screen.getByTestId("hydrated")).toHaveTextContent("true"),
  );
}

describe("CartProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("removes saved lines the server no longer sells, so the badge matches what can be shown", async () => {
    const [product] = listProducts();
    mockServer([product]);
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        { productId: product.id, quantity: 1 },
        { productId: "removed-product", quantity: 2 },
      ]),
    );
    window.localStorage.setItem(
      "ip-shap-demo-cart",
      JSON.stringify([{ productId: "legacy", quantity: 9 }]),
    );

    render(
      <CartProvider>
        <Probe product={product} />
      </CartProvider>,
    );

    await hydrated();
    await waitFor(() =>
      expect(screen.getByTestId("notice")).toHaveTextContent(
        /no longer available/,
      ),
    );
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("rows")).toHaveTextContent("1");
    expect(window.localStorage.getItem("ip-shap-demo-cart")).toBeNull();
  });

  it("shows a saved cart straight away from the saved product copies", async () => {
    const [product] = listProducts();
    const fetchMock = mockServer([product]);
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ productId: product.id, quantity: 3 }]),
    );
    window.localStorage.setItem(
      CART_PRODUCTS_STORAGE_KEY,
      JSON.stringify([snapshotProduct(product)]),
    );

    render(
      <CartProvider>
        <div />
        <ProbeCount />
      </CartProvider>,
    );

    await hydrated();
    expect(screen.getByTestId("count")).toHaveTextContent("3");
    // It still confirms with the server in the background.
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  });

  it("fetches products for a cart saved by an older version before showing it", async () => {
    const [product] = listProducts();
    mockServer([product]);
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ productId: product.id, quantity: 2 }]),
    );

    render(
      <CartProvider>
        <ProbeCount />
      </CartProvider>,
    );

    await hydrated();
    expect(screen.getByTestId("count")).toHaveTextContent("2");
  });

  it("keeps the saved cart when the server cannot be reached", async () => {
    const [product] = listProducts();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ productId: product.id, quantity: 1 }]),
    );
    window.localStorage.setItem(
      CART_PRODUCTS_STORAGE_KEY,
      JSON.stringify([snapshotProduct(product)]),
    );

    render(
      <CartProvider>
        <ProbeCount />
      </CartProvider>,
    );

    await hydrated();
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toContain(product.id);
  });

  it("adds items and clamps quantity", async () => {
    const [product] = listProducts();
    mockServer([product]);
    render(
      <CartProvider>
        <Probe product={product} />
      </CartProvider>,
    );
    await hydrated();

    act(() => screen.getByText("add").click());
    expect(screen.getByTestId("count")).toHaveTextContent("2");

    act(() => screen.getByText("max").click());
    expect(screen.getByTestId("count")).toHaveTextContent("99");
  });

  it("never lets a shopper put more in the cart than is in stock", async () => {
    const [base] = listProducts();
    const limited = {
      ...base,
      availability: "in_stock" as const,
      stockQuantity: 3,
    };
    mockServer([limited]);
    render(
      <CartProvider>
        <Probe product={limited} />
      </CartProvider>,
    );
    await hydrated();

    act(() => screen.getByText("add").click()); // 2
    act(() => screen.getByText("add").click()); // would be 4, capped at 3
    expect(screen.getByTestId("count")).toHaveTextContent("3");
    act(() => screen.getByText("max").click());
    expect(screen.getByTestId("count")).toHaveTextContent("3");
  });

  it("stays empty after clearing even when the page hands the cart a fresh copy of the product", async () => {
    const [base] = listProducts();
    mockServer([base]);
    function Clearer() {
      const { clearCart } = useCart();
      return (
        <button type="button" onClick={clearCart}>
          clear
        </button>
      );
    }
    const tree = (product: DemoProduct) => (
      <CartProvider>
        <Clearer />
        <Probe product={product} />
      </CartProvider>
    );

    const { rerender } = render(tree(base));
    await hydrated();
    act(() => screen.getByText("add").click());
    expect(screen.getByTestId("count")).toHaveTextContent("2");

    // A server refresh hands the provider a brand-new product object in the same commit as a clear.
    act(() => {
      screen.getByText("clear").click();
      rerender(tree({ ...base }));
    });
    expect(screen.getByTestId("count")).toHaveTextContent("0");
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBe("[]");
  });

  it("does not re-render forever when a product in the cart is shown by a card that hands its live copy to a child", async () => {
    // Regression: the shop page froze (navigation never completed) because a card passed its
    // live-stock copy to the quick view, which re-registered the "new" object after every render.
    const [base] = listProducts();
    mockServer([base]);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.startsWith("/api/cart/products")) {
          return new Response(
            JSON.stringify({ products: [snapshotProduct(base)] }),
            { status: 200 },
          );
        }
        return new Response(
          JSON.stringify({
            stock: { [base.id]: { availability: "in_stock", quantity: 5 } },
          }),
          { status: 200 },
        );
      }),
    );
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ productId: base.id, quantity: 1 }]),
    );
    window.localStorage.setItem(
      CART_PRODUCTS_STORAGE_KEY,
      JSON.stringify([snapshotProduct(base)]),
    );
    let renders = 0;
    function Child({ product }: { product: DemoProduct }) {
      renders += 1;
      // Fail fast instead of hanging the test run if the loop ever comes back.
      if (renders > 200) throw new Error("render loop");
      useLiveProduct(product);
      return null;
    }
    function Card({ product }: { product: DemoProduct }) {
      const live = useLiveProduct(product);
      // Passing the live copy (a new object whenever live stock is known) used to start the loop.
      return <Child product={live} />;
    }

    render(
      <CartProvider>
        <ProbeCount />
        <Card product={base} />
      </CartProvider>,
    );
    await hydrated();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    });
    expect(renders).toBeLessThan(30);
  });
});

function ProbeCount() {
  const { itemCount, hydrated: ready } = useCart();
  return (
    <div>
      <p data-testid="hydrated">{String(ready)}</p>
      <p data-testid="count">{itemCount}</p>
    </div>
  );
}
