import { ReservationRepository } from "./reservation.repository";
import { CourtRepository } from "../courts/court.repository";

import {
  CreateReservationInput,
  CreateWalkInReservationInput,
} from "./reservation.validator";

import { calculateHours } from "../../shared/utils/dateTime";

import { BadRequestError } from "../../shared/errors/BadRequestError";
import { ConflictError } from "../../shared/errors/ConflictError";
import { NotFoundError } from "../../shared/errors/NotFoundError";

import {
  PAYMENT_STATUS,
} from "../../constants/payment-status";

import {
  RESERVATION_STATUS,
} from "../../constants/reservation-status";

import {
  COURT_STATUS,
} from "../../constants/court-status";

import { CourtScheduleRepository } from "../court-schedules/courtSchedule.repository";

import { getDayOfWeek } from "../../shared/utils/date";
import { timeToMinutes } from "../../shared/utils/time";

export class ReservationService {

  private reservationRepository =
    new ReservationRepository();

  private courtRepository =
    new CourtRepository();

  private courtScheduleRepository =
    new CourtScheduleRepository();


  /**
   * Create Reservation
   */
    async create(
      userId: number | null,
      data: CreateReservationInput,
      options?: {
        reservationStatus?: string;
        paymentStatus?: string;
        isWalkIn?: boolean;
      }
    ) {

    // ---------------------------------------------------
    // Court Exists
    // ---------------------------------------------------

    const court =
      await this.courtRepository.findById(
        data.court_id
      );

    if (!court) {
      throw new NotFoundError(
        "Court not found."
      );
    }


    // ---------------------------------------------------
    // Guest Validation
    // ---------------------------------------------------

    if (!userId && !options?.isWalkIn) {
      if (
        !data.guest_name ||
        !data.guest_email ||
        !data.guest_phone
      ) {
        throw new BadRequestError(
          "Guest name, email and phone are required."
        );
      }
    }


    // ---------------------------------------------------
    // Court Status
    // ---------------------------------------------------

    if (
      court.status !==
      COURT_STATUS.AVAILABLE
    ) {
      throw new BadRequestError(
        "Court is not available."
      );
    }


    // ---------------------------------------------------
    // Court Schedule
    // ---------------------------------------------------

    const day =
      getDayOfWeek(
        data.reservation_date
      );

    const schedule =
      await this.courtScheduleRepository
        .findByCourtAndDay(
          court.id,
          day
        );

    if (!schedule) {
      throw new BadRequestError(
        "Court has no operating schedule."
      );
    }

    if (schedule.is_closed) {
      throw new BadRequestError(
        "Court is closed on this day."
      );
    }


    // ---------------------------------------------------
    // Calculate Hours
    // ---------------------------------------------------

    const totalHours =
      calculateHours(
        data.start_time,
        data.end_time
      );

    if (totalHours <= 0) {
      throw new BadRequestError(
        "End time must be greater than start time."
      );
    }

    if (totalHours > 2) {
      throw new BadRequestError(
        "Maximum reservation is 2 hours."
      );
    }


    // ---------------------------------------------------
    // Operating Hours
    // ---------------------------------------------------

    const startMinutes =
      timeToMinutes(
        data.start_time
      );

    const endMinutes =
      timeToMinutes(
        data.end_time
      );

    const openMinutes =
      timeToMinutes(
        schedule.open_time
      );

    const closeMinutes =
      timeToMinutes(
        schedule.close_time
      );


    if (
      startMinutes <
      openMinutes
    ) {
      throw new BadRequestError(
        `Court opens at ${schedule.open_time}`
      );
    }


    if (
      endMinutes >
      closeMinutes
    ) {
      throw new BadRequestError(
        `Court closes at ${schedule.close_time}`
      );
    }


    // ---------------------------------------------------
    // Payment Calculation
    // ---------------------------------------------------

    const hourlyRate =
      Number(court.hourly_rate);

    const totalAmount =
      hourlyRate * totalHours;


    // ---------------------------------------------------
    // Create Reservation
    // ---------------------------------------------------
    //
    // IMPORTANT:
    //
    // Conflict checking now happens INSIDE
    // the repository transaction.
    //
    // We intentionally do NOT call
    // checkTimeConflict() here anymore.
    //
    // ---------------------------------------------------

    let reservation;

    try {

      reservation =
        await this.reservationRepository
          .createReservation({

            user_id:
              userId,

            guest_name:
              data.guest_name,

            guest_email:
              data.guest_email,

            guest_phone:
              data.guest_phone,

            court_id:
              data.court_id,

            reservation_date:
              data.reservation_date,

            start_time:
              data.start_time,

            end_time:
              data.end_time,

            total_hours:
              totalHours,

            hourly_rate:
              hourlyRate,

            total_amount:
              totalAmount,

            remarks:
              data.remarks,

           reservation_status:
            options?.reservationStatus ??
            RESERVATION_STATUS.PENDING,

          payment_status:
            options?.paymentStatus ??
            PAYMENT_STATUS.UNPAID,
          });

    } catch (error: any) {

      // -------------------------------------------------
      // Reservation Conflict
      // -------------------------------------------------

      if (
        error.message ===
        "RESERVATION_CONFLICT"
      ) {

        throw new ConflictError(
          "Court already reserved during this time."
        );
      }

      // -------------------------------------------------
      // Other Errors
      // -------------------------------------------------

      throw error;
    }


    // ---------------------------------------------------
    // Response
    // ---------------------------------------------------

    return {

      id:
        reservation.id,

      // Payment API expects this field
      reservation_id:
        reservation.id,

      uuid:
        reservation.uuid,

      reservation_no:
        reservation.reservation_no,

    };
  }


  /**
   * All Reservations
   */
  async getAll() {

    return await this.reservationRepository
      .findAll();

  }


async getById(
  id: number,
  userId: number,
  roleName: string
) {
  const reservation =
    await this.reservationRepository.findById(id);

  if (!reservation) {
    throw new NotFoundError(
      "Reservation not found."
    );
  }

  // =====================================================
  // OWNER / ADMIN CAN VIEW ANY RESERVATION
  // =====================================================

  const isAdmin =
    roleName === "Owner" ||
    roleName === "Admin";

  if (isAdmin) {
    return reservation;
  }

  // =====================================================
  // NORMAL USER CAN ONLY VIEW THEIR OWN RESERVATION
  // =====================================================

  if (reservation.user_id !== userId) {
    throw new NotFoundError(
      "Reservation not found."
    );
  }

  return reservation;
}


  /**
   * My Reservations
   */
  async getMyReservations(
    userId: number
  ) {

    return await this.reservationRepository
      .findUserReservations(
        userId
      );

  }


  /**
   * Cancel Reservation
   */
  async cancel(
    id: number,
    userId: number
  ) {

    const reservation =
      await this.reservationRepository
        .findById(id);

    if (!reservation) {
      throw new NotFoundError(
        "Reservation not found."
      );
    }


    if (
      reservation.user_id !==
      userId
    ) {
      throw new NotFoundError(
        "Reservation not found."
      );
    }


    if (
      reservation.reservation_status ===
      RESERVATION_STATUS.CANCELLED
    ) {
      throw new BadRequestError(
        "Reservation already cancelled."
      );
    }


    return await this.reservationRepository
      .cancelReservation(
        id
      );
  }


  /**
   * Public Reservation Lookup
   */
  async getByUuid(
    uuid: string
  ) {

    const reservation =
      await this.reservationRepository
        .getByUuid(uuid);

    if (!reservation) {
      throw new NotFoundError(
        "Reservation not found."
      );
    }


    return {

      uuid:
        reservation.uuid,

      reservation_no:
        reservation.reservation_no,

      reservation_date:
        reservation.reservation_date,

      start_time:
        reservation.start_time,

      end_time:
        reservation.end_time,

      reservation_status:
        reservation.reservation_status,

      payment_status:
        reservation.payment_status,

      court_name:
        reservation.court_name,

    };
  }

    /**
   * Update Reservation Status
   */
  async updateStatus(
    id: number,
    data: {
      reservation_status: string;
      payment_status: string;
    }
  ) {
    // ---------------------------------------------------
    // Find Reservation
    // ---------------------------------------------------

    const reservation =
      await this.reservationRepository.findById(id);

    if (!reservation) {
      throw new NotFoundError(
        "Reservation not found."
      );
    }

    // ---------------------------------------------------
    // Validate Reservation Status
    // ---------------------------------------------------

    const validReservationStatuses = [
      RESERVATION_STATUS.PENDING,
      RESERVATION_STATUS.CONFIRMED,
      RESERVATION_STATUS.CANCELLED,
      RESERVATION_STATUS.COMPLETED,
    ];

    if (
      !validReservationStatuses.includes(
        data.reservation_status as any
      )
    ) {
      throw new BadRequestError(
        "Invalid reservation status."
      );
    }

    // ---------------------------------------------------
    // Validate Payment Status
    // ---------------------------------------------------

    const validPaymentStatuses = [
      PAYMENT_STATUS.UNPAID,
      PAYMENT_STATUS.PARTIAL,
      PAYMENT_STATUS.PAID,
    ];

    if (
      !validPaymentStatuses.includes(
        data.payment_status as any
      )
    ) {
      throw new BadRequestError(
        "Invalid payment status."
      );
    }

    // ---------------------------------------------------
    // Update
    // ---------------------------------------------------

    return await this.reservationRepository.updateStatus(
      id,
      data.reservation_status,
      data.payment_status
    );
  }

  async createWalkIn(
    data: CreateWalkInReservationInput
  ) {
    return await this.create(
      null,
      data,
      {
        isWalkIn: true,

        reservationStatus:
          RESERVATION_STATUS.CONFIRMED,

        paymentStatus:
          PAYMENT_STATUS.PAID,
      }
    );
  }
}