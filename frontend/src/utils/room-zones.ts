export type RoomZone = {
  roomId: string;
  label: string;
  center: { x: number; y: number };
  bounds?: { x: number; y: number; width: number; height: number };
};

export const ROOM_ZONES: RoomZone[] = [
  {
    roomId: "balcony",
    label: "Varanda",
    center: { x: 130, y: 120 },
    bounds: { x: 70, y: 80, width: 120, height: 80 },
  },
  {
    roomId: "kitchen",
    label: "Cozinha",
    center: { x: 280, y: 130 },
    bounds: { x: 210, y: 80, width: 140, height: 100 },
  },
  {
    roomId: "livingroom",
    label: "Sala",
    center: { x: 500, y: 170 },
    bounds: { x: 380, y: 90, width: 240, height: 150 },
  },
  {
    roomId: "bedroomone",
    label: "Quarto 1",
    center: { x: 170, y: 300 },
    bounds: { x: 90, y: 240, width: 160, height: 120 },
  },
  {
    roomId: "bedroomonewardrobe",
    label: "GR Quarto 1",
    center: { x: 310, y: 280 },
    bounds: { x: 265, y: 240, width: 90, height: 80 },
  },
  {
    roomId: "bedroomtwo",
    label: "Quarto 2",
    center: { x: 170, y: 430 },
    bounds: { x: 90, y: 370, width: 160, height: 120 },
  },
  {
    roomId: "suite",
    label: "Suite",
    center: { x: 510, y: 340 },
    bounds: { x: 410, y: 270, width: 200, height: 140 },
  },
  {
    roomId: "suitewardrobe",
    label: "GR Suite",
    center: { x: 650, y: 320 },
    bounds: { x: 610, y: 285, width: 90, height: 75 },
  },
  {
    roomId: "bathroomsuite",
    label: "BWC Suite",
    center: { x: 650, y: 410 },
    bounds: { x: 610, y: 375, width: 90, height: 70 },
  },
  {
    roomId: "bathroomsocial",
    label: "BWC Social",
    center: { x: 370, y: 285 },
    bounds: { x: 335, y: 245, width: 80, height: 80 },
  },
  {
    roomId: "circulation",
    label: "Circulação",
    center: { x: 370, y: 390 },
    bounds: { x: 330, y: 320, width: 90, height: 150 },
  },
];
