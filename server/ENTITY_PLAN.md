# FitLog Entity Plan

## Principles

- No JPA entity associations are used.
- Cross-table links are stored only as scalar ID columns such as `user_id`, `routine_id`, and `meal_log_id`.
- Entity classes stay independent, and joins are handled in repository queries, QueryDSL, JPQL, or native SQL when needed.
- Current schema planning is based on `IMPLEMENTATION_PLAN.md` and the screen structure under `legacy-html/`.

## JPA setup

- `local`: `ddl-auto=update`
- `prod`: `ddl-auto=validate`
- `test`: `ddl-auto=create-drop`
- Auditing is enabled, so every entity has `created_at` and `updated_at`.

## Core entities

### User area

- `User` -> `users`
  - columns: `id`, `email`, `provider`, `provider_user_id`, `status`
- `UserProfile` -> `user_profiles`
  - columns: `id`, `user_id`, `nickname`, `height_cm`, `profile_image_url`
- `Goal` -> `goals`
  - columns: `id`, `user_id`, `title`, `start_date`, `end_date`
  - goal columns: `target_weight_kg`, `daily_calorie_goal`, `daily_carb_goal_g`, `daily_protein_goal_g`, `daily_fat_goal_g`, `weekly_workout_goal`, `active`

### Routine area

- `Routine` -> `routines`
  - columns: `id`, `user_id`, `name`, `description`, `active`
- `RoutineSchedule` -> `routine_schedules`
  - columns: `id`, `routine_id`, `day_of_week`
- `RoutineExercise` -> `routine_exercises`
  - columns: `id`, `routine_id`, `exercise_name`, `sort_order`, `notes`
- `RoutineExerciseSet` -> `routine_exercise_sets`
  - columns: `id`, `routine_exercise_id`, `set_order`, `target_weight_kg`, `target_repetitions`

### Workout area

- `WorkoutSession` -> `workout_sessions`
  - columns: `id`, `user_id`, `routine_id`, `session_date`
  - record columns: `started_at`, `completed_at`, `duration_minutes`, `calories_burned`, `intensity`, `status`, `memo`
- `WorkoutExercise` -> `workout_exercises`
  - columns: `id`, `session_id`, `routine_exercise_id`, `exercise_name`, `sort_order`
- `WorkoutSet` -> `workout_sets`
  - columns: `id`, `workout_exercise_id`, `set_order`, `weight_kg`, `repetitions`, `completed`

### Meal area

- `MealLog` -> `meal_logs`
  - columns: `id`, `user_id`, `meal_type`, `logged_date`, `memo`
- `MealItem` -> `meal_items`
  - columns: `id`, `meal_log_id`, `food_name`, `quantity`, `quantity_unit`
  - nutrition columns: `calories_kcal`, `carb_g`, `protein_g`, `fat_g`

### Body area

- `BodyMetric` -> `body_metrics`
  - columns: `id`, `user_id`, `measured_on`, `weight_kg`, `skeletal_muscle_kg`, `body_fat_percent`

## Logical links by ID

- `user_profiles.user_id` -> `users.id`
- `goals.user_id` -> `users.id`
- `routines.user_id` -> `users.id`
- `routine_schedules.routine_id` -> `routines.id`
- `routine_exercises.routine_id` -> `routines.id`
- `routine_exercise_sets.routine_exercise_id` -> `routine_exercises.id`
- `workout_sessions.user_id` -> `users.id`
- `workout_sessions.routine_id` -> `routines.id`
- `workout_exercises.session_id` -> `workout_sessions.id`
- `workout_exercises.routine_exercise_id` -> `routine_exercises.id`
- `workout_sets.workout_exercise_id` -> `workout_exercises.id`
- `meal_logs.user_id` -> `users.id`
- `meal_items.meal_log_id` -> `meal_logs.id`
- `body_metrics.user_id` -> `users.id`

## Notes for implementation

- Because entities are decoupled, aggregate loading must be done explicitly in the query layer.
- If referential integrity is required later, it can be added with database foreign keys or migration scripts without reintroducing JPA associations.
- The next natural step is adding repositories and screen-specific read/write APIs on top of these ID-based entities.
