package dev.zebrafinch.chocorec.domain.model

data class TrainingRecord(
    val id: String,
    val date: String,
    val exerciseName: String,
    val count: Int,
    val sets: Int,
    val weight: Float?,
    val createdAt: String,
    val updatedAt: String
)