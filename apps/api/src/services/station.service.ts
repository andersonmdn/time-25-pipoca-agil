import { PrismaClient } from '@prisma/client'
import { stationResponseSchema } from 'packages/validations/dist'
import { z } from 'zod'

const prisma = new PrismaClient()

export async function listNearbyStations(
  lat: number,
  lng: number,
  radius: number,
): Promise<z.infer<typeof stationResponseSchema>[]> {
  const dDeg = radius / 111320 // ~ meters per degree
  const stations = await prisma.station.findMany({
    where: {
      latitude: { gte: lat - dDeg, lte: lat + dDeg },
      longitude: { gte: lng - dDeg, lte: lng + dDeg },
    },
    take: 200,
  })

  return stationResponseSchema.array().parse(stations)
}

export async function getStationById(
  id: string,
): Promise<z.infer<typeof stationResponseSchema> | null> {
  const station = await prisma.station.findUnique({ where: { id } })
  if (!station) return null
  return stationResponseSchema.parse(station)
}
