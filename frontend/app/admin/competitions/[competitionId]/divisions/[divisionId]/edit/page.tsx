"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Save,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";


// ============================================================
// TYPES
// ============================================================

type SkillLevel =
  | "beginner"
  | "novice"
  | "intermediate";

type DivisionFormat =
  | "singles"
  | "doubles";

type DivisionStatus =
  | "open"
  | "closed"
  | "in_progress"
  | "completed";

interface Division {
  id: number;
  competition_id: number;
  name: string;
  skill_level: SkillLevel;
  format: DivisionFormat;
  max_players: number | null;
  entry_fee: number;
  status: DivisionStatus;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}


// ============================================================
// PAGE
// ============================================================

export default function EditDivisionPage() {
  const params = useParams();
  const router = useRouter();

  const competitionId = Number(
    params.competitionId
  );

  const divisionId = Number(
    params.divisionId
  );


  // ==========================================================
  // STATE
  // ==========================================================

  const [division, setDivision] =
    useState<Division | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);


  // ==========================================================
  // FORM
  // ==========================================================

  const [name, setName] =
    useState("");

  const [skillLevel, setSkillLevel] =
    useState<SkillLevel>("beginner");

  const [format, setFormat] =
    useState<DivisionFormat>("singles");

  const [maxPlayers, setMaxPlayers] =
    useState("");

  const [entryFee, setEntryFee] =
    useState("");

  const [status, setStatus] =
    useState<DivisionStatus>("open");


  // ==========================================================
  // VALID IDS
  // ==========================================================

  const validIds =
    Number.isInteger(competitionId) &&
    competitionId > 0 &&
    Number.isInteger(divisionId) &&
    divisionId > 0;


  // ==========================================================
  // LOAD DIVISION
  // ==========================================================

  const loadDivision =
    useCallback(async () => {

      if (!validIds) {
        setError(
          "Invalid competition or division ID."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError(null);

        /*
         * GET:
         * /competitions/:competitionId/divisions
         */

        const response =
          await api.get<
            ApiResponse<Division[]>
          >(
            `/competitions/${competitionId}/divisions`
          );

        const divisions =
          response.data.data || [];

        const foundDivision =
          divisions.find(
            (item) =>
              Number(item.id) === divisionId
          );

        if (!foundDivision) {
          setError(
            "Competition division not found."
          );

          return;
        }

        setDivision(foundDivision);

        // Populate form

        setName(
          foundDivision.name || ""
        );

        setSkillLevel(
          foundDivision.skill_level
        );

        setFormat(
          foundDivision.format
        );

        setMaxPlayers(
          foundDivision.max_players === null ||
          foundDivision.max_players === undefined
            ? ""
            : String(
                foundDivision.max_players
              )
        );

        setEntryFee(
          foundDivision.entry_fee === null ||
          foundDivision.entry_fee === undefined
            ? ""
            : String(
                foundDivision.entry_fee
              )
        );

        setStatus(
          foundDivision.status
        );

      } catch (err: any) {

        console.error(
          "Load division error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load competition division."
        );

      } finally {
        setLoading(false);
      }

    }, [
      competitionId,
      divisionId,
      validIds,
    ]);


  useEffect(() => {
    loadDivision();
  }, [loadDivision]);


  // ==========================================================
  // SAVE
  // ==========================================================

  async function handleSubmit(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  setError(null);
  setSuccess(null);

  // ==================================================
  // VALIDATION
  // ==================================================

  if (!name.trim()) {
    setError(
      "Division name is required."
    );
    return;
  }

  if (!skillLevel) {
    setError(
      "Skill level is required."
    );
    return;
  }

  if (!format) {
    setError(
      "Format is required."
    );
    return;
  }

  const parsedMaxPlayers =
    maxPlayers.trim() === ""
      ? null
      : Number(maxPlayers);

  if (
    parsedMaxPlayers !== null &&
    (
      !Number.isInteger(
        parsedMaxPlayers
      ) ||
      parsedMaxPlayers <= 0
    )
  ) {
    setError(
      "Maximum players must be a valid positive number."
    );
    return;
  }

  const parsedEntryFee =
    Number(entryFee);

  if (
    !Number.isFinite(
      parsedEntryFee
    ) ||
    parsedEntryFee < 0
  ) {
    setError(
      "Entry fee must be a valid amount."
    );
    return;
  }

  // ==================================================
  // SAVE
  // ==================================================

  try {
    setSaving(true);
    setError(null);

    await api.patch(
      `/competitions/divisions/${divisionId}`,
      {
        name: name.trim(),

        skill_level:
          skillLevel,

        format:
          format,

        max_players:
          parsedMaxPlayers,

        entry_fee:
          parsedEntryFee,

        status:
          status,
      }
    );

    setSuccess(
      "Division updated successfully."
    );

    // ==================================================
    // RETURN TO OPEN PLAY
    // ==================================================

    setTimeout(() => {
      router.push(
        `/admin/competitions/${competitionId}/divisions/${divisionId}/open-play`
      );
    }, 700);

  } catch (err: any) {
    console.error(
      "Update division error:",
      err
    );

    setError(
      err?.response?.data?.message ||
        "Unable to update competition division."
    );

  } finally {
    setSaving(false);
  }
}


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <main className="min-h-[calc(100vh-64px)] bg-slate-50 text-slate-900">

        <div className="mx-auto flex min-h-[500px] max-w-[1500px] items-center justify-center px-5 py-6 lg:px-8">

          <div className="flex items-center gap-3 text-sm text-slate-500">

            <Loader2 className="h-5 w-5 animate-spin" />

            Loading division...

          </div>

        </div>

      </main>
    );
  }


  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 text-slate-900">

      <div className="mx-auto max-w-[1500px] px-5 py-6 lg:px-8">


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>

            {/* Breadcrumb */}

            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">

              <Link
                href="/admin/competitions"
                className="transition-colors hover:text-slate-900"
              >
                Competitions
              </Link>

              <ChevronRight className="h-4 w-4" />

              <span>
                Division {divisionId}
              </span>

              <ChevronRight className="h-4 w-4" />

              <span className="text-slate-700">
                Edit
              </span>

            </div>


            {/* Title */}

            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Edit Division
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update the settings for this competition division.
            </p>

          </div>


          {/* Back */}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(
                `/admin/competitions/${competitionId}/divisions/${divisionId}/open-play`
              )
            }
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >

            <ArrowLeft className="mr-2 h-4 w-4" />

            Back to Open Play

          </Button>

        </div>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (

          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <div className="flex-1">
              {error}
            </div>

            <button
              type="button"
              onClick={() =>
                setError(null)
              }
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>

          </div>

        )}


        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (

          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">

            <CheckCircle2 className="mt-0.5 h-4 w-4" />

            <div>
              {success}
            </div>

          </div>

        )}


        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
        >

          <Card className="border-slate-200 bg-white shadow-sm">


            <CardHeader className="border-b border-slate-100">

              <CardTitle className="text-base font-semibold text-slate-950">
                Division Details
              </CardTitle>

              <p className="text-sm text-slate-500">
                Configure the division information and registration settings.
              </p>

            </CardHeader>


            <CardContent className="space-y-6 p-6">


              {/* ==================================================
                  DIVISION NAME
              ================================================== */}

              <div className="space-y-2">

                <label
                  htmlFor="division-name"
                  className="text-sm font-medium text-slate-700"
                >
                  Division Name
                </label>

                <Input
                  id="division-name"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Open Play"
                  disabled={saving}
                  className="border-slate-200 bg-white text-slate-900"
                />

              </div>


              {/* ==================================================
                  SKILL + FORMAT
              ================================================== */}

              <div className="grid gap-6 md:grid-cols-2">


                {/* Skill Level */}

                <div className="space-y-2">

                  <label
                    htmlFor="skill-level"
                    className="text-sm font-medium text-slate-700"
                  >
                    Skill Level
                  </label>

                  <select
                    id="skill-level"
                    value={skillLevel}
                    onChange={(event) =>
                      setSkillLevel(
                        event.target.value as SkillLevel
                      )
                    }
                    disabled={saving}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <option value="beginner">
                      Beginner
                    </option>

                    <option value="novice">
                      Novice
                    </option>

                    <option value="intermediate">
                      Intermediate
                    </option>

                  </select>

                </div>


                {/* Format */}

                <div className="space-y-2">

                  <label
                    htmlFor="format"
                    className="text-sm font-medium text-slate-700"
                  >
                    Format
                  </label>

                  <select
                    id="format"
                    value={format}
                    onChange={(event) =>
                      setFormat(
                        event.target.value as DivisionFormat
                      )
                    }
                    disabled={saving}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <option value="singles">
                      Singles
                    </option>

                    <option value="doubles">
                      Doubles
                    </option>

                  </select>

                </div>

              </div>


              {/* ==================================================
                  MAX PLAYERS + ENTRY FEE
              ================================================== */}

              <div className="grid gap-6 md:grid-cols-2">


                {/* Max Players */}

                <div className="space-y-2">

                  <label
                    htmlFor="max-players"
                    className="text-sm font-medium text-slate-700"
                  >
                    Maximum Players
                  </label>

                  <Input
                    id="max-players"
                    type="number"
                    min="1"
                    step="1"
                    value={maxPlayers}
                    onChange={(event) =>
                      setMaxPlayers(
                        event.target.value
                      )
                    }
                    placeholder="e.g. 20"
                    disabled={saving}
                    className="border-slate-200 bg-white text-slate-900"
                  />

                  <p className="text-xs text-slate-500">
                    Leave empty if the division has no player limit.
                  </p>

                </div>


                {/* Entry Fee */}

                <div className="space-y-2">

                  <label
                    htmlFor="entry-fee"
                    className="text-sm font-medium text-slate-700"
                  >
                    Entry Fee
                  </label>

                  <Input
                    id="entry-fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={entryFee}
                    onChange={(event) =>
                      setEntryFee(
                        event.target.value
                      )
                    }
                    placeholder="0.00"
                    disabled={saving}
                    className="border-slate-200 bg-white text-slate-900"
                  />

                </div>

              </div>


              {/* ==================================================
                  STATUS
              ================================================== */}

              <div className="space-y-2">

                <label
                  htmlFor="status"
                  className="text-sm font-medium text-slate-700"
                >
                  Status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value as DivisionStatus
                    )
                  }
                  disabled={saving}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <option value="open">
                    Open
                  </option>

                  <option value="closed">
                    Closed
                  </option>

                  <option value="in_progress">
                    In Progress
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                </select>

              </div>


              {/* ==================================================
                  CURRENT DIVISION INFO
              ================================================== */}

              {division && (

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <div className="grid gap-4 sm:grid-cols-3">


                    <div>

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Division ID
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        #{division.id}
                      </p>

                    </div>


                    <div>

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Competition ID
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        #{division.competition_id}
                      </p>

                    </div>


                    <div>

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Current Status
                      </p>

                      <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                        {division.status.replace(
                          "_",
                          " "
                        )}
                      </p>

                    </div>


                  </div>

                </div>

              )}

            </CardContent>


            {/* ==================================================
                FOOTER
            ================================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">


              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() =>
                  router.push(
                    `/admin/competitions/${competitionId}/divisions/${divisionId}/open-play`
                  )
                }
                className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>


              <Button
                type="submit"
                disabled={saving}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >

                {saving ? (

                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>

                ) : (

                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>

                )}

              </Button>


            </div>

          </Card>

        </form>

      </div>

    </main>
  );
}