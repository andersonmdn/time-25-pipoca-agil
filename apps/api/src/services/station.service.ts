import { PrismaClient } from '@prisma/client'
import { StationResponse, stationResponseSchema } from 'packages/validations/dist'

const prisma = new PrismaClient()

export async function listNearbyStations(lat: number, lng: number, radius: number): Promise<StationResponse[]> {
  const dDeg = radius / 111320 // ~ Metros por grau
  const stations = await prisma.station.findMany({
    where: {
      latitude: { gte: lat - dDeg, lte: lat + dDeg },
      longitude: { gte: lng - dDeg, lte: lng + dDeg },
    },
    take: 200,
  })

  return stationResponseSchema.array().parse(stations)
}

export async function getStationById(id: number): Promise<StationResponse> {
  const station = await prisma.station.findUnique({ where: { id } })

  return stationResponseSchema.parse(station)
}
