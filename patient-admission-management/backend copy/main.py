from datetime import date
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import Base, engine, get_db
from models import Patient
from schemas import PatientCreate, PatientUpdate, PatientOut

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Patient Admission Management API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Patient Admission API is running"}

@app.get("/api/patients", response_model=list[PatientOut])
def list_patients(
    search: str = Query(default=""),
    ward: str = Query(default=""),
    department: str = Query(default=""),
    doctor: str = Query(default=""),
    db: Session = Depends(get_db),
):
    query = db.query(Patient)
    if search:
        query = query.filter(Patient.name.ilike(f"%{search.strip()}%"))
    if ward:
        query = query.filter(Patient.ward == ward)
    if department:
        query = query.filter(Patient.department == department)
    if doctor:
        query = query.filter(Patient.doctor == doctor)
    return query.order_by(Patient.id.desc()).all()

@app.post("/api/patients", response_model=PatientOut, status_code=201)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    patient = Patient(**payload.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

@app.put("/api/patients/{patient_id}", response_model=PatientOut)
def update_patient(patient_id: int, payload: PatientUpdate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    for key, value in payload.model_dump().items():
        setattr(patient, key, value)
    db.commit()
    db.refresh(patient)
    return patient

@app.patch("/api/patients/{patient_id}/discharge", response_model=PatientOut)
def discharge_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    patient.status = "Discharged"
    db.commit()
    db.refresh(patient)
    return patient

@app.delete("/api/patients/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    db.delete(patient)
    db.commit()
    return {"message": "Patient deleted successfully."}
