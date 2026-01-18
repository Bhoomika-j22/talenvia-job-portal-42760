import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Talenvia overview", () => {
  render(<App />);
  expect(screen.getByText(/Talenvia/i)).toBeInTheDocument();
  expect(screen.getByText(/Overview/i)).toBeInTheDocument();
});
