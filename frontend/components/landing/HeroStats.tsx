export default function HeroStats() {
  return (
    <div
      className="
      glass
      rounded-3xl
      p-6
      w-64
      absolute
      bottom-6
      left-6
    "
    >
      <h3 className="text-3xl font-bold">
        2
      </h3>

      <p className="text-slate-400">
        Premium Courts
      </p>

      <div className="mt-4 h-px bg-white/10"/>

      <div className="mt-4 flex justify-between">

        <div>

          <p className="font-bold">
            4.9★
          </p>

          <small className="text-slate-400">
            Rating
          </small>

        </div>

        <div>

          <p className="font-bold">
            Open
          </p>

          <small className="text-slate-400">
            Daily
          </small>

        </div>

      </div>

    </div>
  );
}