import { ReservationRepository } from "./reservation.repository";
import { CourtRepository } from "../courts/court.repository";

import type {
  CreateReservationInput,
  CreateWalkInReservationInput,
} from "./reservation.validator";

import { calculateHours } from "../../shared/utils/dateTime";

import { BadRequestError } from "../../shared/errors/BadRequestError";
import { ConflictError } from "../../shared/errors/ConflictError";
import { NotFoundError } from "../../shared/errors/NotFoundError";

import { CustomerRepository } from "../customer/customer.repository";

import { PAYMENT_STATUS } from "../../constants/payment-status";
import { RESERVATION_STATUS } from "../../constants/reservation-status";
import { COURT_STATUS } from "../../constants/court-status";

import { CourtScheduleRepository } from "../court-schedules/courtSchedule.repository";

import { getDayOfWeek } from "../../shared/utils/date";
import { timeToMinutes } from "../../shared/utils/time";

export class ReservationService {

  private reservationRepository =
    new ReservationRepository();

  private courtRepository =
    new CourtRepository();

  private customerRepository =
    new CustomerRepository();

  private courtScheduleRepository =
    new CourtScheduleRepository();

  // =====================================================
  // CREATE ONLINE RESERVATION
  // =====================================================

  async create(
    userId: number | null,
    data: CreateReservationInput,
    options?: {
      reservationStatus?: string;
      paymentStatus?: string;
      isWalkIn?: boolean;
    }
  ) {

    // ===================================================
    // FIND COURT
    // ===================================================

    const court =
      await this.courtRepository.findById(
        data.court_id
      );

    if (!court) {
      throw new NotFoundError(
        "Court not found."
      );
    }

    // ===================================================
    // CUSTOMER VALIDATION
    // ===================================================

    if (
      !data.guest_name ||
      !data.guest_phone
    ) {
      throw new BadRequestError(
        "Customer name and phone are required."
      );
    }

    // ===================================================
    // COURT STATUS
    // ===================================================

    if (
      court.status !==
      COURT_STATUS.AVAILABLE
    ) {
      throw new BadRequestError(
        "Court is not available."
      );
    }

    // ===================================================
    // COURT SCHEDULE
    // ===================================================

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

    // ===================================================
    // CALCULATE HOURS
    // ===================================================

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

    // ===================================================
    // OPERATING HOURS
    // ===================================================

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

    if (startMinutes < openMinutes) {
      throw new BadRequestError(
        `Court opens at ${schedule.open_time}`
      );
    }

    if (endMinutes > closeMinutes) {
      throw new BadRequestError(
        `Court closes at ${schedule.close_time}`
      );
    }

    // ===================================================
    // PAYMENT
    // ===================================================

    const hourlyRate =
      Number(court.hourly_rate);

    const totalAmount =
      hourlyRate * totalHours;

    // ===================================================
    // FIND OR CREATE CUSTOMER
    // ===================================================

    let customerId: number | null = null;

    const email =
      data.guest_email?.trim() || null;

    const phone =
      data.guest_phone?.trim() || null;

    // ===================================================
    // FIND BY EMAIL
    // ===================================================

    if (email) {

      const existingCustomer =
        await this.customerRepository.findByEmail(
          email
        );

      if (existingCustomer) {
        customerId =
          existingCustomer.id;
      }
    }

    // ===================================================
    // FIND BY PHONE
    // =====================================================

    if (!customerId && phone) {

      const existingCustomer =
        await this.customerRepository.findByPhone(
          phone
        );

      if (existingCustomer) {
        customerId =
          existingCustomer.id;
      }
    }

    // ===================================================
    // CREATE CUSTOMER
    // =====================================================

    if (!customerId) {

      const name =
        data.guest_name.trim();

      const parts =
        name.split(/\s+/);

      const firstName =
        parts.shift() || name;

      const lastName =
        parts.join(" ") || "";

      const customer =
        await this.customerRepository.create({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          status: "Active",
        });

      if (!customer) {
        throw new BadRequestError(
          "Failed to create customer."
        );
      }

      customerId =
        customer.id;
    }

    // ===================================================
    // CREATE RESERVATION
    // ===================================================

    try {

      const reservation =
        await this.reservationRepository
          .createReservation({

            user_id:
              userId,

            customer_id:
              customerId,

            guest_name:
              data.guest_name,

            guest_email:
              email ?? undefined,

            guest_phone:
              phone ?? undefined,

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

      return reservation;

    } catch (error: any) {

      // =================================================
      // NORMAL RESERVATION CONFLICT
      // =================================================

      if (
        error.message ===
        "RESERVATION_CONFLICT"
      ) {
        throw new ConflictError(
          "Court already reserved during this time."
        );
      }

      // =================================================
      // COMPETITION / OPEN PLAY CONFLICT
      // =================================================

      if (
        error.message ===
        "COMPETITION_COURT_ALLOCATION_CONFLICT"
      ) {
        throw new ConflictError(
          "This court is reserved for a competition or Open Play during this time."
        );
      }

      // =================================================
      // COURT NOT FOUND
      // =================================================

      if (
        error.message ===
        "COURT_NOT_FOUND"
      ) {
        throw new NotFoundError(
          "Court not found."
        );
      }

      throw error;
    }
  }

  // =====================================================
  // GET ALL
  // =====================================================

  async getAll() {
    return await this.reservationRepository
      .findAll();
  }

  // =====================================================
  // GET BY ID
  // =====================================================

  async getById(
    id: number,
    userId: number,
    roleName: string
  ) {

    const reservation =
      await this.reservationRepository
        .findById(id);

    if (!reservation) {
      throw new NotFoundError(
        "Reservation not found."
      );
    }

    const isAdmin =
      roleName === "Owner" ||
      roleName === "Admin";

    if (isAdmin) {
      return reservation;
    }

    if (
      reservation.user_id !==
      userId
    ) {
      throw new NotFoundError(
        "Reservation not found."
      );
    }

    return reservation;
  }

  // =====================================================
  // MY RESERVATIONS
  // =====================================================

  async getMyReservations(
    userId: number
  ) {
    return await this.reservationRepository
      .findUserReservations(
        userId
      );
  }

  // =====================================================
  // CANCEL
  // =====================================================

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
      .cancelReservation(id);
  }

  // =====================================================
  // PUBLIC UUID LOOKUP
  // =====================================================

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

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  async updateStatus(
    id: number,
    data: {
      reservation_status: string;
      payment_status: string;
    }
  ) {

    const reservation =
      await this.reservationRepository
        .findById(id);

    if (!reservation) {
      throw new NotFoundError(
        "Reservation not found."
      );
    }

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

    return await this.reservationRepository
      .updateStatus(
        id,
        data.reservation_status,
        data.payment_status
      );
  }

// =====================================================
// CREATE WALK-IN
// =====================================================

async createWalkIn(
  data: CreateWalkInReservationInput
) {
  // ===================================================
  // FIND CUSTOMER
  // ===================================================

  const customer =
    await this.customerRepository.findById(
      data.customer_id
    );

  if (!customer) {
    throw new NotFoundError(
      "Customer not found."
    );
  }

  // ===================================================
  // CUSTOMER NAME
  // ===================================================

  const guestName =
    [
      customer.first_name,
      customer.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  // ===================================================
  // BUILD RESERVATION DATA
  // ===================================================

  const reservationData = {
    ...data,

    customer_id:
      customer.id,

    guest_name:
      guestName,

    guest_email:
      customer.email?.trim() || "",

    guest_phone:
      customer.phone?.trim() || "",

    remarks:
      data.remarks?.trim() || "",
  };

  // ===================================================
  // CREATE RESERVATION
  // ===================================================

  return this.create(
    null,
    reservationData,
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