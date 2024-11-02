from sqlalchemy import create_engine, Column, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
# Define database URL (replace with your MySQL username, password, and database name)
DATABASE_URL = os.getenv('DATABASE_URL')

# Set up SQLAlchemy engine and base
engine = create_engine(DATABASE_URL)
Base = declarative_base()

# Define User table
class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True, autoincrement=True)
    score = Column(Integer, default=0)

# Create all tables (if not already created)
Base.metadata.create_all(engine)

# Set up session to interact with the database
Session = sessionmaker(bind=engine)
session = Session()

# Function to add an initial user if none exists
def create_initial_user():
    existing_user = session.query(User).first()
    if existing_user is None:
        initial_user = User(score=0)
        session.add(initial_user)
        session.commit()
        print("Initial user created with score 0.")
    else:
        print("User already exists.")

# Run the function to create the initial user
if __name__ == "__main__":
    create_initial_user()
    print("Database setup complete.")
