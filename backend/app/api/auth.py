from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import models, schemas, auth_utils
from ..database import get_db

router = APIRouter(
    prefix="/api/auth",
    tags=['Authentication']
)

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user_credentials: schemas.UserCreate, db: Session = Depends(get_db)):
    
    # Check if email is already registered
    existing_user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered.")

    # Hash the password
    hashed_password = auth_utils.hash_password(user_credentials.password)
    user_dict = user_credentials.dict()
    del user_dict["password"]
    user_dict["password_hash"] = hashed_password
    
    # Store to database
    new_user = models.User(**user_dict)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")
    
    if not auth_utils.verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")
    
    # Create Token
    access_token = auth_utils.create_access_token(data={"user_id": user.id, "email": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}
