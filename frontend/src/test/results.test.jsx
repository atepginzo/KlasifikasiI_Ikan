import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ResultCard from "../components/results/ResultCard.jsx";

const mockResultNormal = {
  predicted_class: "fish_01",
  confidence: 0.9882,
  inference_ms: 75.4,
  prediction_id: "pred-123",
  top5: [
    { class_name: "fish_01", confidence: 0.9882 },
    { class_name: "fish_02", confidence: 0.0091 },
    { class_name: "fish_05", confidence: 0.0015 },
    { class_name: "fish_09", confidence: 0.0008 },
    { class_name: "fish_03", confidence: 0.0003 },
  ],
};

const mockPerClassMetrics = [
  { class_name: "fish_01", precision: 0.99, recall: 0.99, f1: 0.99, support: 1820 },
  { class_name: "fish_18", precision: 0.88, recall: 0.88, f1: 0.88, support: 8 },
  { class_name: "fish_21", precision: 1.0, recall: 0.33, f1: 0.50, support: 3 },
];

describe("ResultCard component", () => {
  it("renders predicted class label and Indonesian formatted confidence percentage", () => {
    render(<ResultCard result={mockResultNormal} perClassMetrics={mockPerClassMetrics} />);
    const matches = screen.getAllByText("fish_01");
    expect(matches.length).toBeGreaterThanOrEqual(1);
    // 98.8% in id-ID format (appears in header and top bar)
    const pctMatches = screen.getAllByText("98,8%");
    expect(pctMatches.length).toBeGreaterThanOrEqual(1);
  });

  it("renders all Top 5 entries in descending order with rank numbers", () => {
    render(<ResultCard result={mockResultNormal} perClassMetrics={mockPerClassMetrics} />);
    expect(screen.getByText("1. fish_01")).toBeInTheDocument();
    expect(screen.getByText("2. fish_02")).toBeInTheDocument();
    expect(screen.getByText("3. fish_05")).toBeInTheDocument();
    expect(screen.getByText("4. fish_09")).toBeInTheDocument();
    expect(screen.getByText("5. fish_03")).toBeInTheDocument();
  });

  it("displays <0,1% for very small probability values", () => {
    const mockWithTinyValue = {
      ...mockResultNormal,
      top5: [
        { class_name: "fish_01", confidence: 0.9999 },
        { class_name: "fish_02", confidence: 0.00004 },
        { class_name: "fish_03", confidence: 0.00003 },
        { class_name: "fish_04", confidence: 0.00002 },
        { class_name: "fish_05", confidence: 0.00001 },
      ],
    };
    render(<ResultCard result={mockWithTinyValue} perClassMetrics={mockPerClassMetrics} />);
    const tinyLabels = screen.getAllByText("<0,1%");
    expect(tinyLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("shows low confidence warning when confidence is below 0.60", () => {
    const lowConfResult = {
      ...mockResultNormal,
      confidence: 0.45,
    };
    render(<ResultCard result={lowConfResult} perClassMetrics={mockPerClassMetrics} />);
    expect(screen.getByText(/Keyakinan rendah/i)).toBeInTheDocument();
  });

  it("shows small support warning when predicted class support <= 10", () => {
    const smallSupportResult = {
      ...mockResultNormal,
      predicted_class: "fish_18",
      confidence: 0.88,
      top5: [{ class_name: "fish_18", confidence: 0.88 }],
    };
    render(<ResultCard result={smallSupportResult} perClassMetrics={mockPerClassMetrics} />);
    expect(screen.getByText(/memiliki hanya 8 sampel uji/i)).toBeInTheDocument();
  });
});
