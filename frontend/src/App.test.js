import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Team Directory header", () => {
  render(<App />);
  expect(screen.getByText(/team directory/i)).toBeInTheDocument();
});
