import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EditorLayout } from "./EditorLayout";

describe("rectangle editing", () => {
  it("creates, edits, moves, resizes, and deletes a rectangle at non-100% zoom", () => {
    render(<EditorLayout />);
    const page = document.querySelector(".editor-page");
    expect(page).not.toBeNull();
    page!.getBoundingClientRect = () =>
      ({
        left: 100,
        top: 200,
        right: 940,
        bottom: 970,
        width: 840,
        height: 770,
        x: 100,
        y: 200,
        toJSON: () => ({}),
      }) as DOMRect;

    fireEvent.click(screen.getByRole("button", { name: "Retângulo" }));
    fireEvent.pointerDown(page!, { button: 0, clientX: 310, clientY: 305, pointerId: 1 });

    const rectangle = page!.querySelector(".editor-selected") as HTMLElement;
    expect(rectangle).toHaveStyle({ left: "300px", top: "150px", width: "160px", height: "100px" });
    expect(screen.getByRole("button", { name: "Seleção" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Retângulo 1")).toBeInTheDocument();

    fireEvent.pointerDown(page!, { button: 0, clientX: 800, clientY: 800, pointerId: 4 });
    fireEvent.pointerDown(rectangle, { button: 0, clientX: 310, clientY: 305, pointerId: 5 });
    expect(rectangle).toHaveClass("editor-selected");

    fireEvent.change(screen.getByRole("spinbutton", { name: "X" }), { target: { value: "320" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Y" }), { target: { value: "170" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "L" }), { target: { value: "180" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "A" }), { target: { value: "120" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Preenchimento" }), {
      target: { value: "#123456" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Borda" }), {
      target: { value: "#654321" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Esp." }), { target: { value: "3" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Raio" }), { target: { value: "8" } });

    expect(rectangle).toHaveStyle({
      left: "320px",
      top: "170px",
      width: "180px",
      height: "120px",
      background: "#123456",
      border: "3px solid #654321",
      borderRadius: "8px",
    });

    fireEvent.pointerDown(rectangle, { button: 0, clientX: 324, clientY: 324, pointerId: 2 });
    fireEvent.pointerMove(rectangle, { clientX: 338, clientY: 338, pointerId: 2 });
    fireEvent.pointerUp(rectangle, { clientX: 338, clientY: 338, pointerId: 2 });
    expect(rectangle).toHaveStyle({ left: "340px", top: "190px" });

    const southeastHandle = rectangle.querySelectorAll(".editor-handle")[3]!;
    fireEvent.pointerDown(southeastHandle, { button: 0, clientX: 464, clientY: 408, pointerId: 3 });
    fireEvent.pointerMove(rectangle, { clientX: 478, clientY: 422, pointerId: 3 });
    fireEvent.pointerUp(rectangle, { clientX: 478, clientY: 422, pointerId: 3 });
    expect(rectangle).toHaveStyle({ width: "200px", height: "140px" });

    fireEvent.keyDown(screen.getByRole("textbox", { name: "Preenchimento" }), { key: "Backspace" });
    expect(rectangle).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Delete" });
    expect(page!.querySelector(".editor-selected")).toBeNull();
  });
});
