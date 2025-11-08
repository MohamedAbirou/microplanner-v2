"""Pydantic schemas for request/response validation"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum


class DayOfWeek(str, Enum):
    monday = "monday"
    tuesday = "tuesday"
    wednesday = "wednesday"
    thursday = "thursday"
    friday = "friday"
    saturday = "saturday"
    sunday = "sunday"


class EnergyPattern(str, Enum):
    MORNING_PERSON = "MORNING_PERSON"
    NIGHT_OWL = "NIGHT_OWL"
    BALANCED = "BALANCED"


class BlockedTime(BaseModel):
    day: DayOfWeek
    start: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    end: str = Field(..., pattern=r"^\d{2}:\d{2}$")


class UserPreferences(BaseModel):
    wakeTime: str = Field(default="07:00", pattern=r"^\d{2}:\d{2}$")
    sleepTime: str = Field(default="23:00", pattern=r"^\d{2}:\d{2}$")
    workStartTime: str = Field(default="09:00", pattern=r"^\d{2}:\d{2}$")
    workEndTime: str = Field(default="17:00", pattern=r"^\d{2}:\d{2}$")
    productivityPeaks: List[str] = Field(default_factory=list)
    energyPattern: Optional[EnergyPattern] = None
    blockedTimes: Optional[List[BlockedTime]] = None


class Goal(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    frequencyPerWeek: int = Field(ge=1, le=7)
    durationMinutes: int = Field(ge=15, le=480)
    preferredTimes: List[str] = Field(default_factory=list)
    priority: int = Field(ge=1, le=10, default=5)
    flexibilityScore: int = Field(ge=1, le=10, default=5)


class BusySlot(BaseModel):
    day: DayOfWeek
    start: str
    end: str
    title: str


class PlannedTask(BaseModel):
    goalId: str
    title: str
    start: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    end: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    reasoning: str


class PlanStructure(BaseModel):
    monday: List[PlannedTask] = Field(default_factory=list)
    tuesday: List[PlannedTask] = Field(default_factory=list)
    wednesday: List[PlannedTask] = Field(default_factory=list)
    thursday: List[PlannedTask] = Field(default_factory=list)
    friday: List[PlannedTask] = Field(default_factory=list)
    saturday: List[PlannedTask] = Field(default_factory=list)
    sunday: List[PlannedTask] = Field(default_factory=list)


class GeneratePlanRequest(BaseModel):
    weekStartDate: str
    userId: str
    goals: List[Goal]
    preferences: UserPreferences
    busySlots: Optional[List[BusySlot]] = None
    userTier: str = "FREE"


class PlanMetadata(BaseModel):
    model: str
    tier: str
    latency: float
    cost: float
    tokenUsage: Optional[int] = None


class GeneratePlanResponse(BaseModel):
    success: bool
    plan: Optional[PlanStructure] = None
    complexity: str
    qualityScore: float
    metadata: PlanMetadata
    error: Optional[Dict] = None
