import api from "@/lib/api";

export const courtScheduleService = {

    async getByCourt(courtId:number){

        const response =
            await api.get(
                `/court-schedules/court/${courtId}`
            );

        return response.data.data;
    }

}