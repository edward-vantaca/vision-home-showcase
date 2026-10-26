import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AmenityBookingStage } from "../AmenityBookingStage";
import { VT } from "../../viewTransitionNames";

const q = (uxId: string) => document.querySelector<HTMLElement>(`[data-ux-id="${uxId}"]`);

describe("AmenityBookingStage", () => {
  it("shows the week of Oct 25–31 2026 from 9 AM to 5 PM with today's date marked", () => {
    const { container } = render(<AmenityBookingStage amenity="Conference Room" />);
    expect(container.textContent).toContain("October 2026");
    expect(container.textContent).toContain("10/26/2026");
    for (const label of ["9 AM", "12 PM", "5 PM"]) expect(container.textContent).toContain(label);
    expect(container.textContent).not.toContain("8 AM");
    expect(container.textContent).not.toContain("6 PM");
    expect(screen.getAllByText("Tentative Reservation")).toHaveLength(2);
  });

  it("only open hours can be booked: not past ones, not held ones", () => {
    render(<AmenityBookingStage amenity="Conference Room" />);
    expect(q("amenity-calendar-slot-25-13")).toBeNull(); // Sunday, past
    expect(q("amenity-calendar-slot-26-10")).toBeNull(); // today, before now
    expect(q("amenity-calendar-slot-26-16")).not.toBeNull(); // today, later
    expect(q("amenity-calendar-slot-28-10")).toBeNull(); // Wed, reserved 9–12
    expect(q("amenity-calendar-slot-28-12")).not.toBeNull();
  });

  it("clicking the walkthrough's open slot opens the Book Reservation modal for it, and × closes it", () => {
    render(<AmenityBookingStage amenity="Conference Room" />);
    const slot = document.querySelector<HTMLElement>(`[data-vt-name="${VT.AmenityCalendarOpenSlot}"]`)!;
    expect(slot.getAttribute("data-ux-id")).toBe("amenity-calendar-slot-27-13");
    fireEvent.click(slot);

    const modal = q("book-reservation-modal")!;
    expect(modal.textContent).toContain("Conference Room");
    expect(modal.textContent).toContain("Book Reservation");
    expect(modal.textContent).toContain("10/27/2026");
    expect(modal.textContent).toContain("Select file(s) to upload");
    const start = q("booking-start-time") as HTMLSelectElement;
    const end = q("booking-end-time") as HTMLSelectElement;
    expect(start.selectedOptions[0].textContent).toBe("1:00 PM");
    expect(end.selectedOptions[0].textContent).toBe("3:00 PM");

    fireEvent.click(document.querySelector<HTMLElement>(`[data-vt-name="${VT.BookingModalClose}"]`)!);
    expect(q("book-reservation-modal")).toBeNull();
  });
});
