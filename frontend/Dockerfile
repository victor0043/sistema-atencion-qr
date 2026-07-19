FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Vite reemplaza import.meta.env.VITE_* de forma estática en tiempo de build,
# no las lee del entorno del contenedor en runtime. Deben llegar como build args.
ARG VITE_AUTH_URL
ARG VITE_ADMIN_URL
ARG VITE_PATIENT_URL
ARG VITE_APPOINTMENT_URL
ARG VITE_MEDICAL_URL

ENV VITE_AUTH_URL=$VITE_AUTH_URL
ENV VITE_ADMIN_URL=$VITE_ADMIN_URL
ENV VITE_PATIENT_URL=$VITE_PATIENT_URL
ENV VITE_APPOINTMENT_URL=$VITE_APPOINTMENT_URL
ENV VITE_MEDICAL_URL=$VITE_MEDICAL_URL

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
