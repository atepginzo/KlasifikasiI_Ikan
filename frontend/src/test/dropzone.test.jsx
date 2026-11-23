import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DropZone from "../components/upload/DropZone.jsx";

describe("DropZone client-side validation", () => {
  it("rejects unsupported file format and displays error message", () => {
    const onSelect = vi.fn();
    render(<DropZone onFileSelect={onSelect} limits={{ max_upload_mb: 5, allowed_types: ["image/jpeg", "image/png", "image/webp"] }} />);

    const badFile = new File(["dummy"], "document.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText("Pilih file gambar");
    fireEvent.change(input, { target: { files: [badFile] } });

    expect(screen.getByText(/Format tidak didukung/i)).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("rejects file exceeding size limit and displays error message", () => {
    const onSelect = vi.fn();
    render(<DropZone onFileSelect={onSelect} limits={{ max_upload_mb: 5, allowed_types: ["image/jpeg", "image/png"] }} />);

    // Create 6MB dummy file
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "huge.png", { type: "image/png" });
    const input = screen.getByLabelText("Pilih file gambar");
    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(screen.getByText(/Ukuran melebihi 5 MB/i)).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("accepts valid image and calls onFileSelect", () => {
    const onSelect = vi.fn();
    render(<DropZone onFileSelect={onSelect} limits={{ max_upload_mb: 5, allowed_types: ["image/jpeg", "image/png", "image/webp"] }} />);

    const validFile = new File(["valid"], "fish.png", { type: "image/png" });
    const input = screen.getByLabelText("Pilih file gambar");
    fireEvent.change(input, { target: { files: [validFile] } });

    expect(onSelect).toHaveBeenCalledWith(validFile);
  });
});
