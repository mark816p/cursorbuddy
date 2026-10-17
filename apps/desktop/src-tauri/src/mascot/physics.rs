//! Damped Spring Physics Engine for Mascot Cursor Follow
//!
//! Uses a critically damped harmonic oscillator (damping ratio = 1.0)
//! ensuring zero overshoot and smooth, responsive tracking.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Vec2 {
    pub x: f64,
    pub y: f64,
}

impl Vec2 {
    pub fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }
}

pub struct SpringFollower2D {
    pub pos: Vec2,
    pub vel: Vec2,
    pub target: Vec2,
    pub stiffness: f64, // k
    pub damping: f64,   // c = 2 * sqrt(k * m)
    pub mass: f64,      // m
    pub offset_x: f64,
    pub offset_y: f64,
}

impl SpringFollower2D {
    pub fn new(initial_x: f64, initial_y: f64) -> Self {
        let stiffness = 120.0;
        let mass = 1.0;
        // Critical damping: c = 2 * sqrt(k * m)
        let damping = 2.0 * (stiffness * mass).sqrt();

        Self {
            pos: Vec2::new(initial_x, initial_y),
            vel: Vec2::new(0.0, 0.0),
            target: Vec2::new(initial_x, initial_y),
            stiffness,
            damping,
            mass,
            offset_x: 32.0,
            offset_y: -48.0,
        }
    }

    /// Set cursor anchor position and apply dynamic offset mirroring to prevent cursor obstruction.
    pub fn set_cursor_target(&mut self, cursor_x: f64, cursor_y: f64) {
        let mut off_x = self.offset_x;
        let mut off_y = self.offset_y;

        // If cursor is too close to current position, mirror quadrant
        let dist = ((self.pos.x - cursor_x).powi(2) + (self.pos.y - cursor_y).powi(2)).sqrt();
        if dist < 20.0 {
            off_x = -off_x;
            off_y = -off_y;
        }

        self.target = Vec2::new(cursor_x + off_x, cursor_y + off_y);
    }

    /// Advance physics simulation by dt seconds.
    pub fn step(&mut self, dt: f64) -> Vec2 {
        let dt = dt.clamp(0.001, 0.1);

        // F = -k * (x - target) - c * v
        let force_x = -self.stiffness * (self.pos.x - self.target.x) - self.damping * self.vel.x;
        let force_y = -self.stiffness * (self.pos.y - self.target.y) - self.damping * self.vel.y;

        let accel_x = force_x / self.mass;
        let accel_y = force_y / self.mass;

        self.vel.x += accel_x * dt;
        self.vel.y += accel_y * dt;

        self.pos.x += self.vel.x * dt;
        self.pos.y += self.vel.y * dt;

        self.pos
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_spring_convergence_to_target() {
        let mut follower = SpringFollower2D::new(0.0, 0.0);
        follower.target = Vec2::new(100.0, 100.0);

        // Simulate 60 steps at dt = 1/60s (1 second)
        for _ in 0..60 {
            follower.step(1.0 / 60.0);
        }

        // Pos should smoothly approach target (within 1px tolerance) without overshoot
        assert!((follower.pos.x - 100.0).abs() < 1.0);
        assert!((follower.pos.y - 100.0).abs() < 1.0);
    }
}
