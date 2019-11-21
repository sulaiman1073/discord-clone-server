const pii = require("../pii");

describe("pii test", () => {
  it("should be either an empty array or an array of strings", () => {
    expect(Array.isArray(pii)).toBeTruthy();
    expect(pii.length).toBeGreaterThanOrEqual(0);

    let isStringArray = true;

    for (let index = 0; index < pii.length; index++) {
      if (typeof pii[index] !== "string") isStringArray = false;
    }

    expect(isStringArray).toBeTruthy();
  });
});
