export const ROOM_STATE_CHANGED_EVENT = "room_state_changed";

const ROOM_CHANNEL_PREFIX = "wavelength-room";

export function getRoomChannelName(roomCode: string) {
  return `${ROOM_CHANNEL_PREFIX}:${roomCode.toLowerCase()}`;
}
