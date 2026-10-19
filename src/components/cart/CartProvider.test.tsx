import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CartProvider, useCart } from "@/components/cart/CartProvider";
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
});
