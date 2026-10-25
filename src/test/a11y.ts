import axe from "axe-core";

/**
 * Runs axe on rendered markup and returns readable problems (empty = none found).
 * Colour contrast needs real layout, so it is switched off in jsdom.
 */
export async function findA11yProblems(container: Element): Promise<string[]> {
  const result = await axe.run(container, {
    rules: { "color-contrast": { enabled: false } },
  });
  return result.violations.map(
    (violation) =>
      `${violation.id}: ${violation.help} (${violation.nodes
        .map((node) => node.target.join(" "))
        .join(", ")})`,
  );
}
