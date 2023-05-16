# Use an official Python runtime as the base image
FROM python:3.9.2

# Set environment variables for Python and Docker
ENV MONGODB_HOST='mongodb://admin:abc123!@mongodb:27017'
ENV MONGODB_DB_NAME='MythicTableDjango'

# Set the working directory in the container
WORKDIR /code

# Copy the project requirements file to the working directory
COPY requirements.txt /code/

# Install project dependencies
RUN pip3 install -r requirements.txt

# Copy the project files to the working directory
COPY . /code/

# Expose the port that Django runs on
EXPOSE 5001

# Define the command to run when the container starts
CMD ["python3", "MythicTable/manage.py", "runserver", "0.0.0.0:5001", "--skip-check"]