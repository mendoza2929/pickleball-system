import { ReservationRepository } from "./reservation.repository";
import { CourtRepository } from "../courts/court.repository";

import {
    CreateReservationInput,
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

import { COURT_STATUS } from "../../constants/court-status";

import { CourtScheduleRepository } from "../court-schedules/courtSchedule.repository";

import { getDayOfWeek } from "../../shared/utils/date";
import { timeToMinutes } from "./../../shared/utils/time";




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
        data: CreateReservationInput
    ) {

        //---------------------------------------------------
        // Court Exists
        //---------------------------------------------------

        const court =
            await this.courtRepository.findById(
                data.court_id
            );

        if (!court) {
            throw new NotFoundError(
                "Court not found."
            );
        }

        if (!userId) {
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

        if (court.status !== COURT_STATUS.AVAILABLE) {
            throw new BadRequestError(
                "Court is not available."
            );
        }


        //----------------------------------
        // Court Schedule
        //----------------------------------

        const day = getDayOfWeek(
            data.reservation_date
        );

        const schedule =
            await this.courtScheduleRepository.findByCourtAndDay(
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

        //---------------------------------------------------
        // Hours
        //---------------------------------------------------

        const totalHours = calculateHours(
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

        const startMinutes =
            timeToMinutes(data.start_time);

        const endMinutes =
            timeToMinutes(data.end_time);

        const openMinutes =
            timeToMinutes(schedule.open_time);

        const closeMinutes =
            timeToMinutes(schedule.close_time);

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

        //---------------------------------------------------
        // Conflict
        //---------------------------------------------------

        const reservationExists =
            await this.reservationRepository.checkTimeConflict(
                data.court_id,
                data.reservation_date,
                data.start_time,
                data.end_time
            );

        if (reservationExists) {
            throw new ConflictError(
                "Court already reserved during this time."
            );
        }

        //---------------------------------------------------
        // Payment
        //---------------------------------------------------

        const hourlyRate =
            Number(court.hourly_rate);

        const totalAmount =
            hourlyRate * totalHours;

        //---------------------------------------------------
        // Save
        //---------------------------------------------------

        return await this.reservationRepository.createReservation({

        user_id: userId,

        guest_name: data.guest_name,

        guest_email: data.guest_email,

        guest_phone: data.guest_phone,

        court_id: data.court_id,

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
            RESERVATION_STATUS.PENDING,

        payment_status:
            PAYMENT_STATUS.UNPAID,
    });

    }

    /**
     * All Reservations
     */
    async getAll() {

        return await this.reservationRepository.findAll();

    }

    /**
     * Reservation Details
     */
    async getById(
        id: number,
        userId: number
        ) {
        const reservation =
            await this.reservationRepository.findById(id);

        if (!reservation) {
            throw new NotFoundError(
            "Reservation not found."
            );
        }

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
    async getMyReservations(userId: number) {

        return await this.reservationRepository.findUserReservations(
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
            await this.reservationRepository.findById(id);

        if (!reservation) {
            throw new NotFoundError(
            "Reservation not found."
            );
        }

        if (reservation.user_id !== userId) {
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

        return await this.reservationRepository.cancelReservation(
            id
        );
        }
        async getByUuid(uuid: string) {
        const reservation =
            await this.reservationRepository.getByUuid(uuid);

        if (!reservation) {
            throw new NotFoundError(
            "Reservation not found."
            );
        }

        return {
            uuid: reservation.uuid,

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

}