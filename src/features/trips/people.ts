export interface TripPerson {
  id: string;
  tripId: string;
  displayName: string;
  emoji: string;
  sortOrder: number;
}

export const SAMPLE_PEOPLE = ["Alex", "Sam"] as const;

export const initialTripPeople: TripPerson[] = ["trip_jeju", "trip_osaka", "trip_nagoya"].flatMap(
  (tripId) =>
    SAMPLE_PEOPLE.map((displayName, sortOrder) => ({
      id: `person_${tripId}_${sortOrder}`,
      tripId,
      displayName,
      emoji: "",
      sortOrder,
    })),
);

export function personLabel(person: Pick<TripPerson, "displayName" | "emoji">): string {
  const emoji = person.emoji.trim();
  return emoji ? `${emoji} ${person.displayName}` : person.displayName;
}
