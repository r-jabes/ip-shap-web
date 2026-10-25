import { cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { findA11yProblems } from "@/test/a11y";

vi.mock("@/app/(storefront)/product/actions", () => ({
  requestRestockAction: vi.fn(async () => ({})),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { NotifyMeForm } from "@/components/product/NotifyMeForm";
import { SaveButton } from "@/components/saved/SaveButton";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

afterEach(() => cleanup());

describe("accessibility basics (axe)", () => {
  it("the back-in-stock form has labelled fields and no violations", async () => {
    const { container } = render(
      <NotifyMeForm productId="11111111-1111-4111-8111-111111111111" productName="Red Wine" />,
    );
    expect(await findA11yProblems(container)).toEqual([]);
  });

  it("save buttons are named and expose their pressed state", async () => {
    const { container } = render(
      <div>
        <SaveButton productId="p1" productName="Red Wine" />
        <SaveButton productId="p2" productName="White Wine" variant="button" />
      </div>,
    );
    expect(await findA11yProblems(container)).toEqual([]);
  });

  it("a form field shows its error to assistive technology", async () => {
    const { container, getByRole } = render(
      <form>
        <Field id="phone" label="Phone" error="Enter a valid number.">
          <Input id="phone" aria-invalid="true" aria-describedby="phone-error" />
        </Field>
        <Button type="submit">Send</Button>
      </form>,
    );
    expect(getByRole("alert")).toHaveTextContent("Enter a valid number.");
    expect(await findA11yProblems(container)).toEqual([]);
  });
});
