import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CartProvider, useCart } from "@/components/cart/CartProvider";
import { CatalogueProvider } from "@/components/catalogue/CatalogueProvider";
import { CART_STORAGE_KEY } from "@/lib/cart";
import { listProducts } from "@/lib/catalogue";

function Probe() {
  const { itemCount, items, notice, hydrated, addItem, setQuantity } =
    useCart();
  return (
    <div>
      <p data-testid="hydrated">{String(hydrated)}</p>
      <p data-testid="count">{itemCount}</p>
      <p data-testid="rows">{items.length}</p>
      <p data-testid="notice">{notice ?? ""}</p>
      <button type="button" onClick={() => addItem(listProducts()[0].id, 2)}>
        add
      </button>
      <button
        type="button"
        onClick={() => setQuantity(listProducts()[0].id, 500)}
      >
        max
      </button>
    </div>
  );
}

describe("CartProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("prunes stale lines on load so the badge matches what can be shown", async () => {
    const [product] = listProducts();
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
        <Probe />
      </CartProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("hydrated")).toHaveTextContent("true"),
    );
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("rows")).toHaveTextContent("1");
    expect(screen.getByTestId("notice")).toHaveTextContent(
      /no longer available/,
    );
    expect(window.localStorage.getItem("ip-shap-demo-cart")).toBeNull();
  });

  it("adds items and clamps quantity", async () => {
    render(
      <CartProvider>
        <Probe />
      </CartProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("hydrated")).toHaveTextContent("true"),
    );

    act(() => screen.getByText("add").click());
    expect(screen.getByTestId("count")).toHaveTextContent("2");

    act(() => screen.getByText("max").click());
    expect(screen.getByTestId("count")).toHaveTextContent("99");
  });

  it("never lets a shopper put more in the cart than is in stock", async () => {
    const [base] = listProducts();
    const limited = { ...base, availability: "in_stock" as const, stockQuantity: 3 };
    render(
      <CatalogueProvider products={[limited]} categories={[]} brands={[]}>
        <CartProvider>
          <Probe />
        </CartProvider>
      </CatalogueProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("hydrated")).toHaveTextContent("true"),
    );

    act(() => screen.getByText("add").click()); // 2
    act(() => screen.getByText("add").click()); // would be 4, capped at 3
    expect(screen.getByTestId("count")).toHaveTextContent("3");
    act(() => screen.getByText("max").click());
    expect(screen.getByTestId("count")).toHaveTextContent("3");
  });

  it("stays empty after clearing even when the catalogue is re-supplied by the server", async () => {
    const [base] = listProducts();
    const tree = (products: typeof base[]) => (
      <CatalogueProvider products={products} categories={[]} brands={[]}>
        <CartProvider>
          <Clearer />
          <Probe />
        </CartProvider>
      </CatalogueProvider>
    );
    function Clearer() {
      const { clearCart } = useCart();
      return (
        <button type="button" onClick={clearCart}>
          clear
        </button>
      );
    }

    const { rerender } = render(tree([base]));
    await waitFor(() =>
      expect(screen.getByTestId("hydrated")).toHaveTextContent("true"),
    );
    act(() => screen.getByText("add").click());
    expect(screen.getByTestId("count")).toHaveTextContent("2");

    // A server refresh hands the provider a brand-new catalogue array in the same commit as a clear.
    act(() => {
      screen.getByText("clear").click();
      rerender(tree([{ ...base }]));
    });
    expect(screen.getByTestId("count")).toHaveTextContent("0");
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBe("[]");
  });
});
