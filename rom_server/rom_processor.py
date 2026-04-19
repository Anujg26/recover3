import cv2
import math
import time
import mediapipe as mp
import numpy as np
import base64

# ──────────────────────────────────────────────
#  Geometry helpers
# ──────────────────────────────────────────────

def calculate_angle(a, b, c):
    ax, ay = a; bx, by = b; cx, cy = c
    ba_x, ba_y = ax - bx, ay - by
    bc_x, bc_y = cx - bx, cy - by
    dot = ba_x * bc_x + ba_y * bc_y
    mag_ba = math.hypot(ba_x, ba_y)
    mag_bc = math.hypot(bc_x, bc_y)
    if mag_ba == 0 or mag_bc == 0:
        return 0.0
    cos_angle = max(-1.0, min(1.0, dot / (mag_ba * mag_bc)))
    return math.degrees(math.acos(cos_angle))

def landmark_to_xy(landmark, w, h):
    return landmark.x * w, landmark.y * h

def point_in_frame(landmark, w, h, margin=30):
    x, y = landmark_to_xy(landmark, w, h)
    return (margin <= x <= w - margin) and (margin <= y <= h - margin)

def torso_upright(shoulder_xy, hip_xy, max_lean_deg=14.0):
    sx, sy = shoulder_xy; hx, hy = hip_xy
    dx, dy = sx - hx, sy - hy
    if dy == 0:
        return False, 90.0
    lean_deg = math.degrees(math.atan2(abs(dx), abs(dy)))
    return lean_deg <= max_lean_deg, lean_deg

def smooth_point(prev, current, alpha=0.45):
    if prev is None:
        return current
    return (
        prev[0] * (1 - alpha) + current[0] * alpha,
        prev[1] * (1 - alpha) + current[1] * alpha,
    )

def make_phone_view(frame, target_w=1080, target_h=1920):
    h, w, _ = frame.shape
    target_ratio = target_w / target_h
    current_ratio = w / h
    if current_ratio > target_ratio:
        new_w = int(h * target_ratio)
        x1 = (w - new_w) // 2
        frame = frame[:, x1:x1 + new_w]
    else:
        new_h = int(w / target_ratio)
        y1 = (h - new_h) // 2
        frame = frame[y1:y1 + new_h, :]
    return cv2.resize(frame, (target_w, target_h))

# ──────────────────────────────────────────────
#  Drawing primitives
# ──────────────────────────────────────────────

FONT = cv2.FONT_HERSHEY_DUPLEX

def fs(frame_w, base):
    return base * (frame_w / 1080)

def thick(frame_w, base):
    return max(1, int(base * (frame_w / 1080)))

def put_text_shadow(frame, text, org, scale, color, t):
    x, y = org
    cv2.putText(frame, text, (x + 3, y + 3), FONT, scale, (0, 0, 0), t + 3, cv2.LINE_AA)
    cv2.putText(frame, text, org, FONT, scale, color, t, cv2.LINE_AA)

def text_width(text, scale, thickness):
    (w, _), _ = cv2.getTextSize(text, FONT, scale, thickness)
    return w

def put_text_centered(frame, text, cx, y, scale, color, t):
    tw = text_width(text, scale, t)
    put_text_shadow(frame, text, (cx - tw // 2, y), scale, color, t)

def draw_rounded_rect(frame, x1, y1, x2, y2, color, alpha=0.55, radius=24):
    overlay = frame.copy()
    cv2.rectangle(overlay, (x1 + radius, y1), (x2 - radius, y2), color, -1)
    cv2.rectangle(overlay, (x1, y1 + radius), (x2, y2 - radius), color, -1)
    for cx, cy in [(x1 + radius, y1 + radius), (x2 - radius, y1 + radius),
                   (x1 + radius, y2 - radius), (x2 - radius, y2 - radius)]:
        cv2.circle(overlay, (cx, cy), radius, color, -1)
    cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)

# ──────────────────────────────────────────────
#  UI sections
# ──────────────────────────────────────────────

STATUS_COLORS = {
    "SETUP":     (200, 235, 255),
    "HOLD_DOWN": (255, 235, 160),
    "RAISE":     (160, 255, 200),
    "DONE":      (140, 255, 160),
}

STATE_LABELS = {
    "SETUP":     "GET READY",
    "HOLD_DOWN": "START POSITION",
    "RAISE":     "RAISE YOUR ARM",
    "DONE":      "COMPLETE",
}

def draw_top_card(frame, state, instruction, sub=None):
    h, w = frame.shape[:2]
    card_h = 340
    draw_rounded_rect(frame, 0, 0, w, card_h, (10, 10, 20), alpha=0.72, radius=0)

    color = STATUS_COLORS.get(state, (255, 255, 255))
    label = STATE_LABELS.get(state, state)

    pill_w = text_width(label, fs(w, 1.05), thick(w, 2)) + 60
    pill_x = w // 2 - pill_w // 2
    draw_rounded_rect(frame, pill_x, 22, pill_x + pill_w, 90, color, alpha=0.85, radius=14)
    put_text_centered(frame, label, w // 2, 74, fs(w, 1.05), (10, 10, 20), thick(w, 2))

    put_text_centered(frame, instruction, w // 2, 170, fs(w, 1.6), (255, 255, 255), thick(w, 3))

    if sub:
        put_text_centered(frame, sub, w // 2, 258, fs(w, 1.05), (200, 200, 200), thick(w, 2))

def draw_progress_pill(frame, progress, y_top, color=(0, 220, 120)):
    h, w = frame.shape[:2]
    margin = 60
    bar_h = 38
    x1, x2 = margin, w - margin
    y1, y2 = y_top, y_top + bar_h
    cv2.rectangle(frame, (x1, y1), (x2, y2), (50, 50, 50), -1, cv2.LINE_AA)
    fill = x1 + int((x2 - x1) * max(0.0, min(1.0, progress)))
    if fill > x1:
        cv2.rectangle(frame, (x1, y1), (fill, y2), color, -1, cv2.LINE_AA)
    cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 255), 2, cv2.LINE_AA)
    pct_text = f"{int(progress * 100)}%"
    put_text_centered(frame, pct_text, w // 2, y2 - 6, fs(w, 0.85), (255, 255, 255), thick(w, 2))

def draw_skeleton(frame, s_xy, e_xy, w_xy, h_xy, good_posture):
    line_color = (0, 230, 120) if good_posture else (60, 60, 255)
    dot_color  = (255, 80, 80)
    lw = max(3, int(frame.shape[1] / 180))
    dw = max(10, int(frame.shape[1] / 72))
    cv2.line(frame, s_xy, e_xy, line_color, lw, cv2.LINE_AA)
    cv2.line(frame, e_xy, w_xy, line_color, lw, cv2.LINE_AA)
    cv2.line(frame, s_xy, h_xy, line_color, lw, cv2.LINE_AA)
    for pt in (s_xy, e_xy, w_xy, h_xy):
        cv2.circle(frame, pt, dw, dot_color, -1, cv2.LINE_AA)
        cv2.circle(frame, pt, dw, (255, 255, 255), 2, cv2.LINE_AA)

def draw_bottom_hint(frame, text, color=(200, 200, 200)):
    h, w = frame.shape[:2]
    draw_rounded_rect(frame, 0, h - 130, w, h, (10, 10, 20), alpha=0.65, radius=0)
    put_text_centered(frame, text, w // 2, h - 44, fs(w, 0.95), color, thick(w, 2))

def draw_posture_warning(frame):
    h, w = frame.shape[:2]
    mid_y = h // 2 + 80
    put_text_centered(frame, "Stand tall, don't lean", w // 2, mid_y,
                      fs(w, 1.35), (60, 100, 255), thick(w, 3))

def draw_done_overlay(frame, rom):
    h, w = frame.shape[:2]
    cx = w // 2
    card_top, card_bot = h // 2 - 220, h // 2 + 220
    draw_rounded_rect(frame, 80, card_top, w - 80, card_bot, (10, 30, 10), alpha=0.88, radius=36)
    put_text_centered(frame, "DONE!", cx, card_top + 110, fs(w, 2.4), (80, 255, 140), thick(w, 5))
    put_text_centered(frame, "Shoulder Flexion", cx, card_top + 205, fs(w, 1.1), (200, 200, 200), thick(w, 2))
    put_text_centered(frame, f"{rom:.1f} deg", cx, card_top + 330, fs(w, 3.8), (255, 255, 255), thick(w, 6))
    put_text_centered(frame, "Range of Motion", cx, card_top + 420, fs(w, 1.0), (160, 255, 160), thick(w, 2))

def reset_session():
    return {
        "state": "SETUP",
        "setup_ok_since": None,
        "down_hold_since": None,
        "top_hold_since": None,
        "top_hold_anchor_angle": None,
        "baseline_angles": [],
        "baseline_angle": None,
        "peak_angle": 0.0,
        "bent_frames": 0,
        "posture_bad_frames": 0,
        "last_shoulder_angle": None,
        "last_motion_time": None,
        "movement_started": False,
        "rom": None,
        "lean_deg": None,
        "interrupt_msg": None,
        "interrupt_until": 0.0,
    }

def set_interrupt(session, msg, duration=2.5):
    session["interrupt_msg"] = msg
    session["interrupt_until"] = time.monotonic() + duration

class ROMProcessor:
    SETUP_HOLD_SECONDS       = 1.5
    DOWN_HOLD_SECONDS        = 2.5
    TOP_HOLD_SECONDS         = 2.5
    BENT_ELBOW_THRESHOLD     = 158.0
    BENT_RESET_FRAMES        = 6
    DOWN_SHOULDER_ANGLE_MAX  = 28.0
    ANGLE_MOTION_THRESHOLD   = 1.8
    STOP_MOVING_SECONDS      = 1.1
    MAX_TORSO_LEAN_DEG       = 14.0
    POSTURE_RESET_FRAMES     = 8
    TOP_HOLD_MOVE_THRESHOLD  = 4.0
    MOVE_START_THRESHOLD     = 8.0
    BR_X_RATIO               = 0.40
    BR_Y_RATIO               = 0.42

    def __init__(self):
        mp_pose = mp.solutions.pose
        self.mp_pose = mp_pose
        self.pose = mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=0.6,
            min_tracking_confidence=0.6,
        )
        self.session = reset_session()
        self.smoothed_points = {}
        self.smoothed_shoulder_angle = None

    def reset(self):
        self.session = reset_session()
        self.smoothed_points.clear()
        self.smoothed_shoulder_angle = None

    def process_frame(self, jpeg_bytes: bytes) -> dict:
        """Original entry point for bytes (used by mobile push)"""
        arr = np.frombuffer(jpeg_bytes, np.uint8)
        raw = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if raw is None:
            return {"error": "Could not decode frame"}
        
        # We flip here because the mobile app usually sends a mirrored selfie
        frame = cv2.flip(raw, 1)
        return self.process_image(frame)

    def process_image(self, frame: np.ndarray) -> dict:
        """New entry point for raw numpy frames (used by server capture)"""
        frame = make_phone_view(frame)
        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        cx = w // 2

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb)

        now = time.monotonic()
        session = self.session

        elbow_angle    = None
        shoulder_angle = None
        setup_ok       = False
        posture_ok     = False
        lean_deg       = None
        s_xy = e_xy = w_xy = h_xy = None

        if results.pose_landmarks:
            lm = results.pose_landmarks.landmark
            shoulder_lm = lm[self.mp_pose.PoseLandmark.LEFT_SHOULDER]
            elbow_lm    = lm[self.mp_pose.PoseLandmark.LEFT_ELBOW]
            wrist_lm    = lm[self.mp_pose.PoseLandmark.LEFT_WRIST]
            hip_lm      = lm[self.mp_pose.PoseLandmark.LEFT_HIP]

            required = [shoulder_lm, elbow_lm, wrist_lm, hip_lm]
            all_visible = all(p.visibility > 0.5 and point_in_frame(p, w, h) for p in required)

            if all_visible:
                raw_s = landmark_to_xy(shoulder_lm, w, h)
                raw_e = landmark_to_xy(elbow_lm,    w, h)
                raw_w = landmark_to_xy(wrist_lm,    w, h)
                raw_h = landmark_to_xy(hip_lm,      w, h)

                for key, raw_pt in zip("sewh", [raw_s, raw_e, raw_w, raw_h]):
                    self.smoothed_points[key] = smooth_point(self.smoothed_points.get(key), raw_pt, alpha=0.45)

                s_xy = tuple(int(v) for v in self.smoothed_points["s"])
                e_xy = tuple(int(v) for v in self.smoothed_points["e"])
                w_xy = tuple(int(v) for v in self.smoothed_points["w"])
                h_xy = tuple(int(v) for v in self.smoothed_points["h"])

                posture_ok, lean_deg = torso_upright(s_xy, h_xy, max_lean_deg=self.MAX_TORSO_LEAN_DEG)
                shoulder_in_btm_half = s_xy[1] >= h * 0.48
                setup_ok = shoulder_in_btm_half and posture_ok

                elbow_angle    = calculate_angle(s_xy, e_xy, w_xy)
                shoulder_angle = calculate_angle(h_xy, s_xy, e_xy)

                if self.smoothed_shoulder_angle is None:
                    self.smoothed_shoulder_angle = shoulder_angle
                else:
                    self.smoothed_shoulder_angle = (self.smoothed_shoulder_angle * 0.65 + shoulder_angle * 0.35)

                bent = elbow_angle < self.BENT_ELBOW_THRESHOLD
                draw_skeleton(frame, s_xy, e_xy, w_xy, h_xy, posture_ok)

                if session["state"] == "SETUP":
                    if setup_ok:
                        if session["setup_ok_since"] is None: session["setup_ok_since"] = now
                        if now - session["setup_ok_since"] >= self.SETUP_HOLD_SECONDS:
                            session.update({"state": "HOLD_DOWN", "down_hold_since": None, "baseline_angles": [], "peak_angle": self.smoothed_shoulder_angle, "last_motion_time": now, "movement_started": False})
                    else:
                        session["setup_ok_since"] = None

                elif session["state"] == "HOLD_DOWN":
                    if not posture_ok:
                        session["posture_bad_frames"] += 1
                        if session["posture_bad_frames"] >= self.POSTURE_RESET_FRAMES:
                            self.reset()
                            set_interrupt(self.session, "Posture broke — restarting")
                            session = self.session
                    else:
                        session["posture_bad_frames"] = 0

                    down_ok = (elbow_angle >= self.BENT_ELBOW_THRESHOLD and shoulder_angle <= self.DOWN_SHOULDER_ANGLE_MAX and e_xy[1] > s_xy[1])
                    if down_ok:
                        if session["down_hold_since"] is None: session["down_hold_since"] = now
                        session["baseline_angles"].append(self.smoothed_shoulder_angle)
                        if now - session["down_hold_since"] >= self.DOWN_HOLD_SECONDS:
                            baseline = sum(session["baseline_angles"]) / max(1, len(session["baseline_angles"]))
                            session.update({"state": "RAISE", "baseline_angle": baseline, "peak_angle": self.smoothed_shoulder_angle, "last_motion_time": now, "movement_started": False})
                    else:
                        session["down_hold_since"] = None

                elif session["state"] == "RAISE":
                    if bent: session["bent_frames"] += 1
                    else: session["bent_frames"] = 0
                    if not posture_ok: session["posture_bad_frames"] += 1
                    else: session["posture_bad_frames"] = 0

                    if session["bent_frames"] >= self.BENT_RESET_FRAMES:
                        self.reset(); set_interrupt(self.session, "Keep elbow straight"); session = self.session
                    elif session["posture_bad_frames"] >= self.POSTURE_RESET_FRAMES:
                        self.reset(); set_interrupt(self.session, "Don't lean"); session = self.session
                    else:
                        baseline = session["baseline_angle"] or 0.0
                        if not session["movement_started"]:
                            if self.smoothed_shoulder_angle >= baseline + self.MOVE_START_THRESHOLD:
                                session["movement_started"] = True; session["last_motion_time"] = now
                        else:
                            session["peak_angle"] = max(session["peak_angle"], self.smoothed_shoulder_angle)
                            if abs(self.smoothed_shoulder_angle - (session["last_shoulder_angle"] or 0)) >= self.ANGLE_MOTION_THRESHOLD:
                                session["last_motion_time"] = now
                            session["last_shoulder_angle"] = self.smoothed_shoulder_angle

                            if (now - session["last_motion_time"]) >= self.STOP_MOVING_SECONDS and session["peak_angle"] >= baseline + 15.0:
                                if session["top_hold_since"] is None: session["top_hold_since"] = now
                                elif now - session["top_hold_since"] >= self.TOP_HOLD_SECONDS:
                                    session["rom"] = max(0.0, session["peak_angle"] - baseline)
                                    session["state"] = "DONE"
                            else: session["top_hold_since"] = None
            else:
                if session["state"] in ("HOLD_DOWN", "RAISE"): set_interrupt(session, "Step into view")
        else:
            if session["state"] in ("HOLD_DOWN", "RAISE"): set_interrupt(session, "Searching for torso...")

        # UI Construction
        state = session["state"]
        instruction = ""
        sub = None
        progress = 0.0

        if state == "SETUP":
            if setup_ok:
                elapsed = now - session["setup_ok_since"]
                progress = elapsed / self.SETUP_HOLD_SECONDS
                instruction = "Hold still..."
                sub = f"Starting in {max(0.0, self.SETUP_HOLD_SECONDS - elapsed):.1f}s"
                draw_top_card(frame, state, instruction, sub); draw_progress_pill(frame, progress, 360)
            else:
                instruction = "Step into view"
                sub = "Right side of screen, arm at your side"
                draw_top_card(frame, state, instruction, sub)
            draw_bottom_hint(frame, "Stand to the RIGHT of the camera")

        elif state == "HOLD_DOWN":
            if session["down_hold_since"]:
                elapsed = now - session["down_hold_since"]
                progress = elapsed / self.DOWN_HOLD_SECONDS
                instruction = "Hold position..."
                draw_top_card(frame, state, instruction, f"{max(0.0, self.DOWN_HOLD_SECONDS - elapsed):.1f}s")
                draw_progress_pill(frame, progress, 360, (255, 200, 60))
            else:
                draw_top_card(frame, state, "Arm straight down", "Elbow below shoulder")
            draw_bottom_hint(frame, "Keep arm vertical")

        elif state == "RAISE":
            if session["top_hold_since"]:
                elapsed = now - session["top_hold_since"]
                draw_top_card(frame, state, "Hold still!", f"{max(0.0, self.TOP_HOLD_SECONDS - elapsed):.1f}s")
                draw_progress_pill(frame, elapsed / self.TOP_HOLD_SECONDS, 360, (0, 200, 255))
            else:
                draw_top_card(frame, state, "Raise your arm", "As high as you can")
            draw_bottom_hint(frame, "Don't bend your elbow")

        elif state == "DONE":
            draw_done_overlay(frame, session["rom"])
            draw_bottom_hint(frame, "Tap 'Restart' to try again", (180, 255, 200))

        if session.get("interrupt_msg") and now < session.get("interrupt_until", 0):
            put_text_centered(frame, session["interrupt_msg"], cx, h // 2, fs(w, 1.4), (60, 80, 255), thick(w, 3))

        _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        return {
            "annotated_frame": base64.b64encode(buf).decode("utf-8"),
            "state": state,
            "instruction": instruction,
            "sub": sub,
            "progress": progress,
            "posture_ok": posture_ok,
            "shoulder_angle": self.smoothed_shoulder_angle,
            "rom": session.get("rom"),
            "interrupt_msg": session["interrupt_msg"] if now < session.get("interrupt_until", 0) else None,
        }
