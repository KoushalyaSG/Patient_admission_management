from datetime import date
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator

GENDERS = {"Male", "Female", "Other"}
WARDS = {"General", "ICU", "Emergency", "Pediatrics", "Maternity"}
DEPARTMENTS = {"Cardiology", "Neurology", "Orthopedics", "Pediatrics", "General Medicine"}
DOCTORS = {"Dr. Sharma", "Dr. Patel", "Dr. Rao", "Dr. Singh", "Dr. Kumar"}

class PatientBase(BaseModel):
    name: str = Field(min_length=1)
    age: int = Field(ge=0, le=120)
    gender: Literal["Male", "Female", "Other"]
    ward: str
    department: str
    doctor: str
    admission_date: date
    status: Literal["Admitted", "Discharged"] = "Admitted"

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        value = value.strip()
        if not value or not value.replace(" ", "").isalpha():
            raise ValueError("Name is required and must contain letters only.")
        return value

    @field_validator("ward")
    @classmethod
    def validate_ward(cls, value):
        if value not in WARDS:
            raise ValueError("Please select a valid ward.")
        return value

    @field_validator("department")
    @classmethod
    def validate_department(cls, value):
        if value not in DEPARTMENTS:
            raise ValueError("Please select a valid department.")
        return value

    @field_validator("doctor")
    @classmethod
    def validate_doctor(cls, value):
        if value not in DOCTORS:
            raise ValueError("Please select a valid doctor.")
        return value

    @field_validator("admission_date")
    @classmethod
    def validate_admission_date(cls, value):
        if value > date.today():
            raise ValueError("Admission date cannot be in the future.")
        return value

class PatientCreate(PatientBase):
    pass

class PatientUpdate(PatientBase):
    pass

class PatientOut(PatientBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
