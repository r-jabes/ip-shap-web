import { describe, expect, it } from "vitest";
import { mapProductRow } from "./map-row";

describe("mapProductRow", () => {
  it("maps taxonomy, images, and inventory", () => {
    const product = mapProductRow({
      id: "33333333-3333-4333-8333-333333333333",
      slug: "seed-house-red",
      name: "House Red",
      description: "Seed",
      price_rwf: 15000,
      status: "published",
      availability: "unknown",
      is_provisional: false,
      is_featured: true,
      featured_sort: 0,
      categories: { slug: "wine", name: "Wine" },
      brands: { slug: "ip-shap-house", name: "IP SHAP" },
      product_images: [
        {
          id: "img-1",
          role: "catalogue_primary",
          src: "/branding/app-icon.png",
          zoom_src: null,
          alt: "House Red",
          width: 158,
          height: 155,
          sort_order: 0,
          processing_status: "approved_for_catalogue",
          original_ref: null,
          source_filename: null,
          crop_instructions: null,
          rights_note: null,
          is_shared_multi_product_photo: false,
          needs_client_confirmation: false,
        },
      ],
      inventory_levels: { quantity: 12, availability: "in_stock" },
    });

    expect(product.categorySlug).toBe("wine");
    expect(product.brandSlug).toBe("ip-shap-house");
    expect(product.price.amount).toBe(15000);
    expect(product.availability).toBe("in_stock");
    expect(product.stockQuantity).toBe(12);
    expect(product.images).toHaveLength(1);
    expect(product.demoLabel).toBe("");
  });

  it("tolerates missing images and soft price values", () => {
    const product = mapProductRow({
      id: "55555555-5555-4555-8555-555555555555",
      slug: "imported-no-image",
      name: "Imported",
      description: null,
      price_rwf: "12000.4",
      status: "draft",
      availability: "unknown",
      is_provisional: null,
      categories: null,
      brands: null,
      product_images: [
        {
          id: "bad",
          role: "catalogue_primary",
          src: "",
          zoom_src: null,
          alt: "",
          width: 0,
          height: 0,
          sort_order: 0,
          processing_status: "approved_for_catalogue",
          original_ref: null,
          source_filename: null,
          crop_instructions: null,
          rights_note: null,
          is_shared_multi_product_photo: null,
          needs_client_confirmation: null,
        },
      ],
      inventory_levels: null,
    });

    expect(product.description).toBe("");
    expect(product.price.amount).toBe(12000);
    expect(product.images).toHaveLength(0);
    expect(product.brandSlug).toBe("");
    expect(product.brandName).toBe("");
    expect(product.status).toBe("draft");
  });
});
