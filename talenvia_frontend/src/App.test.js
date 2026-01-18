import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Talenvia overview and combined Profile & Skills nav item", () => {
  render(<App />);
  expect(screen.getByText(/Talenvia/i)).toBeInTheDocument();
  expect(screen.getByText(/Overview/i)).toBeInTheDocument();
  expect(screen.getByText(/Profile & Skills/i)).toBeInTheDocument();
});
