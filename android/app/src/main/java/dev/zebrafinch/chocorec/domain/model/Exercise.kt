package dev.zebrafinch.chocorec.domain.model

data class Exercise(
    val id: String,
    val name: String,
    val color: String,
    val order: Int,
    val isActive: Boolean,
    val createdAt: String,
    val updatedAt: String
)