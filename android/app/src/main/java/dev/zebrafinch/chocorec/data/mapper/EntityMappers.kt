package dev.zebrafinch.chocorec.data.mapper

import dev.zebrafinch.chocorec.data.db.ExerciseEntity
import dev.zebrafinch.chocorec.data.db.TrainingRecordEntity
import dev.zebrafinch.chocorec.domain.model.Exercise
import dev.zebrafinch.chocorec.domain.model.TrainingRecord

fun TrainingRecordEntity.toDomain(): TrainingRecord {
    return TrainingRecord(
        id = id,
        date = date,
        exerciseName = exerciseName,
        count = count,
        sets = sets,
        weight = weight,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

fun TrainingRecord.toEntity(): TrainingRecordEntity {
    return TrainingRecordEntity(
        id = id,
        date = date,
        exerciseName = exerciseName,
        count = count,
        sets = sets,
        weight = weight,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

fun ExerciseEntity.toDomain(): Exercise {
    return Exercise(
        id = id,
        name = name,
        color = color,
        order = order,
        isActive = isActive,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

fun Exercise.toEntity(): ExerciseEntity {
    return ExerciseEntity(
        id = id,
        name = name,
        color = color,
        order = order,
        isActive = isActive,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}