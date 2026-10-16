import { useEffect, useState } from "react";
import presets from "./data/presets.json";
import { parseResolution } from "./help";

export default function App() {
  // Preset and Calibrate
  const initialScreen = presets["macbook-pro-14-default"].screen;
  function updateDraft(field, value) {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
    setError("");
  }
  function handlePresetChange(event) {
    const preset = presets[event.target.value];
    const nextScreen = preset.screen;

    setScreen(nextScreen);

    setDraft({
      physical: `${nextScreen.physical.width} x ${nextScreen.physical.height}`,
      logical: `${nextScreen.logical.width} x ${nextScreen.logical.height}`,
      diagonalInches: String(nextScreen.diagonalInches),
    });

    setError("");
  }
  const [screen, setScreen] = useState(initialScreen);
  const [draft, setDraft] = useState({
    physical: `${initialScreen.physical.width} x ${initialScreen.physical.height}`,
    logical: `${initialScreen.logical.width} x ${initialScreen.logical.height}`,
    diagonalInches: String(initialScreen.diagonalInches),
  });
  const [error, setError] = useState("");
  const [measurement, setMeasurement] = useState(null);
  const [hoverPoint, setHoverPoint] = useState(null);
  // Calibrate: using input sizes to calculate pxPerCm
  const ppi =
    Math.sqrt(screen.physical.width ** 2 + screen.physical.height ** 2) /
    screen.diagonalInches;
  const dpr = screen.physical.width / screen.logical.width;
  const pxPerCm = ppi / 2.54 / dpr;
  const rulerStyle = {
    "--cm": `${pxPerCm}px`,
    "--half-cm": `${pxPerCm / 2}px`,
    "--mm": `${pxPerCm / 10}px`,
  };

  function handleCalibrate(event) {
    event.preventDefault();

    const physical = parseResolution(draft.physical);
    const logical = parseResolution(draft.logical);
    const diagonalInches = Number(draft.diagonalInches);

    if (!physical || !logical) {
      setError("分辨率请输入两个正整数，例如 3024 x 1964。");
      return;
    }

    if (!Number.isFinite(diagonalInches) || diagonalInches <= 0) {
      setError("屏幕对角线请输入大于 0 的数字，例如 14.2。");
      return;
    }

    setScreen({
      physical,
      logical,
      diagonalInches,
    });

    setError("");
  }

  // Ruler: responsible for window resize
  // lazy initialize for viewport useState
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  // Ruler: be responsible for window resize
  useEffect(() => {
    function handleResize() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setMeasurement(null);
      setHoverPoint(null);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Ruler: generate numbers
  const createNumbers = (length) =>
    Array.from({ length }, (_, index) => index + 1);
  const horizontalNumbers = createNumbers(Math.floor(viewport.width / pxPerCm));
  const verticalNumbers = createNumbers(Math.floor(viewport.height / pxPerCm));

  function handleMeasure(event) {
    if (event.target.closest("[data-no-measure], .ruler")) {
      return;
    }

    setMeasurement({ x: event.clientX, y: event.clientY });
  }

  function handleHover(event) {
    if (
      event.pointerType === "touch" ||
      event.target.closest("[data-no-measure], .ruler")
    ) {
      setHoverPoint(null);
      return;
    }

    setHoverPoint({ x: event.clientX, y: event.clientY });
  }

  // Preview the pointer position; retain the clicked measurement lines.
  const labelPoint = hoverPoint ?? measurement;
  const coordinates = labelPoint
    ? {
        x: labelPoint.x / pxPerCm,
        y: (viewport.height - labelPoint.y) / pxPerCm,
      }
    : null;
  const labelOnLeft = labelPoint && labelPoint.x > viewport.width / 2;
  const labelAbove = labelPoint && labelPoint.y > viewport.height / 2;

  return (
    <div
      className="min-h-dvh flex items-center justify-center"
      onClick={handleMeasure}
      onPointerMove={handleHover}
      onPointerLeave={() => setHoverPoint(null)}
    >
      <div className="max-w-100 my-10 space-y-10" data-no-measure>
        <h1 className="text-center font-bold text-2xl">Macbook Ruler</h1>

        <div className="space-x-3">
          <label htmlFor="preset" className="text-xl font-semibold">
            Presets
          </label>
          <select
            name="preset"
            id="preset"
            className="bg-stone-200 h-8 w-full block"
            defaultValue="macbook-pro-14-default"
            onChange={handlePresetChange}
          >
            {Object.entries(presets).map(([id, preset]) => (
              <option key={id} value={id}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        <h2 className="text-center font-bold text-xl">Or</h2>

        <form onSubmit={handleCalibrate}>
          <h2 className="text-xl font-semibold">Calibrate</h2>
          <ol className="list-decimal list-outside">
            <li>
              <label htmlFor="physical">Physical Resolution</label>
              <input
                id="physical"
                type="text"
                value={draft.physical}
                onChange={(event) =>
                  updateDraft("physical", event.target.value)
                }
                className="bg-stone-200 outline-none h-8 w-full text-center text-stone-700 block"
              />
            </li>
            <li>
              <label htmlFor="logical">Logical Resolution</label>
              <input
                id="logical"
                type="text"
                value={draft.logical}
                onChange={(event) => updateDraft("logical", event.target.value)}
                className="bg-stone-200 outline-none h-8 w-full text-center text-stone-700 block"
              />
            </li>
            <li>
              <label htmlFor="length">Diagonal Length in inch</label>
              <input
                id="length"
                type="text"
                value={draft.diagonalInches}
                onChange={(event) =>
                  updateDraft("diagonalInches", event.target.value)
                }
                className="bg-stone-200 outline-none h-8 w-full text-center text-stone-700 block"
              />
            </li>
          </ol>
          {error && (
            <p role="alert" className="mt-3 text-red-600">
              {error}
            </p>
          )}
          <button className="w-full bg-stone-200 mt-5 h-8 font-bold">
            Submit
          </button>
        </form>
      </div>

      <div className="ruler ruler-horizontal" style={rulerStyle}>
        {horizontalNumbers.map((num) => (
          <span key={num} className="ruler-number" style={{ left: num * pxPerCm }}>
            {num}
          </span>
        ))}
      </div>
      <div className="ruler ruler-vertical" style={rulerStyle}>
        {verticalNumbers
          .filter((num) => num > 1)
          .map((num) => (
            <span key={num} className="ruler-number" style={{ bottom: num * pxPerCm }}>
              {num}
            </span>
          ))}
      </div>
      {measurement && (
        <>
          <div
            className="measurement-line measurement-horizontal"
            style={{ left: 0, top: measurement.y, width: measurement.x }}
          />
          <div
            className="measurement-line measurement-vertical"
            style={{
              left: measurement.x,
              top: measurement.y,
              height: viewport.height - measurement.y,
            }}
          />
        </>
      )}
      {labelPoint && (
        <div
          className="measurement-label"
          style={{
            left: labelPoint.x + (labelOnLeft ? -12 : 12),
            top: labelPoint.y + (labelAbove ? -12 : 12),
            transform: `translate(${labelOnLeft ? "-100%" : "0"}, ${labelAbove ? "-100%" : "0"})`,
          }}
        >
          ({coordinates.x.toFixed(3)}cm, {coordinates.y.toFixed(3)}cm)
        </div>
      )}
    </div>
  );
}
