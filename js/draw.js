// ---------- turning (yaw in degrees: 0 = facing you, 90 = her side, 180 = her back) ----------
let SPIN_SHIFT = 0; // slides skirt patterns sideways while she turns
const HEAD_R = 36, HEAD_CY = 84;
const SNOWMAN_HEAD_RX = 28, SNOWMAN_HEAD_RY = 44;
const clamp01 = v => Math.max(0, Math.min(1, v));
