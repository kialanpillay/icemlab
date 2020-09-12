import React from "react";
import { render } from "@testing-library/react";
import Home from "./pages/Home";
import Upload from "./pages/Upload";

describe("the Home component", () => {
  test("has the correct heading text", () => {
    const { getByText } = render(<Home />);
    expect(getByText("Virtual Chemistry Lab")).toBeTruthy();
  });
  test("has the correct icon", () => {
    const { getByText } = render(<Home />);
    expect(getByText("science")).toBeTruthy();
  });
});
