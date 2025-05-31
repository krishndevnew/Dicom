import axios from 'axios';

// Orthanc server configuration
const ORTHANC_URL = 'http://localhost:8042';
const ORTHANC_USERNAME = 'orthanc';
const ORTHANC_PASSWORD = 'orthanc';

// Configure axios instance for Orthanc
const orthancApi = axios.create({
  baseURL: ORTHANC_URL,
  auth: {
    username: ORTHANC_USERNAME,
    password: ORTHANC_PASSWORD
  }
});

export interface OrthancPatient {
  ID: string;
  MainDicomTags: {
    PatientName: string;
    PatientID: string;
    PatientBirthDate?: string;
    PatientSex?: string;
  };
}

export interface OrthancStudy {
  ID: string;
  ParentPatient: string;
  MainDicomTags: {
    StudyDate: string;
    StudyDescription: string;
    PatientName: string;
    PatientID: string;
    AccessionNumber: string;
    StudyInstanceUID: string;
    NumberOfStudyRelatedSeries: string;
  };
}

export interface OrthancSeries {
  ID: string;
  ParentStudy: string;
  MainDicomTags: {
    SeriesDescription: string;
    Modality: string;
    SeriesNumber: string;
    SeriesInstanceUID: string;
    NumberOfSeriesRelatedInstances: string;
  };
}

export interface OrthancInstance {
  ID: string;
  FileSize: number;
  FileUuid: string;
  IndexInSeries: number;
  MainDicomTags: {
    SOPInstanceUID: string;
    InstanceNumber: string;
  };
}

export interface GroupedPatientStudy {
  patientId: string;
  patientName: string;
  studies: {
    studyId: string;
    studyDate: string;
    modality: string;
    description: string;
    accessionNumber: string;
    imageUrl: string;
    mediaType: 'dicom' | 'video' | '3d';
    source: 'orthanc' | 'local';
    orthancId?: string;
  }[];
}

class OrthancService {
  // Get all patients
  async getPatients(): Promise<OrthancPatient[]> {
    const response = await orthancApi.get('/patients');
    const patientIds = response.data;
    
    const patients = await Promise.all(
      patientIds.map(async (id: string) => {
        const patientResponse = await orthancApi.get(`/patients/${id}`);
        return patientResponse.data;
      })
    );
    
    return patients;
  }

  // Get all studies for a patient
  async getStudiesForPatient(patientId: string): Promise<OrthancStudy[]> {
    const response = await orthancApi.get(`/patients/${patientId}/studies`);
    const studyIds = response.data;
    
    const studies = await Promise.all(
      studyIds.map(async (id: string) => {
        const studyResponse = await orthancApi.get(`/studies/${id}`);
        return studyResponse.data;
      })
    );
    
    return studies;
  }

  // Get all studies grouped by patient
  async getGroupedStudies(): Promise<GroupedPatientStudy[]> {
    const patients = await this.getPatients();
    
    const groupedStudies = await Promise.all(
      patients.map(async (patient) => {
        const studies = await this.getStudiesForPatient(patient.ID);
        
        const formattedStudies = studies.map(study => ({
          studyId: study.ID,
          studyDate: study.MainDicomTags.StudyDate,
          modality: 'DICOM', // Will be updated when series is loaded
          description: study.MainDicomTags.StudyDescription || 'No description',
          accessionNumber: study.MainDicomTags.AccessionNumber,
          imageUrl: `orthanc:${study.ID}`,
          mediaType: 'dicom' as const,
          source: 'orthanc' as const,
          orthancId: study.ID
        }));

        return {
          patientId: patient.MainDicomTags.PatientID,
          patientName: patient.MainDicomTags.PatientName,
          studies: formattedStudies
        };
      })
    );

    return groupedStudies;
  }

  // Get series for a study
  async getSeriesForStudy(studyId: string): Promise<OrthancSeries[]> {
    const response = await orthancApi.get(`/studies/${studyId}/series`);
    const seriesIds = response.data;
    
    const series = await Promise.all(
      seriesIds.map(async (id: string) => {
        const seriesResponse = await orthancApi.get(`/series/${id}`);
        return seriesResponse.data;
      })
    );
    
    return series;
  }

  // Get instances for a series
  async getInstancesForSeries(seriesId: string): Promise<OrthancInstance[]> {
    const response = await orthancApi.get(`/series/${seriesId}/instances`);
    const instanceIds = response.data;
    
    const instances = await Promise.all(
      instanceIds.map(async (id: string) => {
        const instanceResponse = await orthancApi.get(`/instances/${id}`);
        return instanceResponse.data;
      })
    );
    
    return instances;
  }

  // Get DICOM file URL for an instance
  getDicomFileUrl(instanceId: string): string {
    return `${ORTHANC_URL}/instances/${instanceId}/file`;
  }

  // Get preview image URL for an instance
  getPreviewUrl(instanceId: string): string {
    return `${ORTHANC_URL}/instances/${instanceId}/preview`;
  }

  // Get WADO URI for an instance
  getWadoUrl(studyUID: string, seriesUID: string, instanceUID: string): string {
    return `${ORTHANC_URL}/wado?requestType=WADO&studyUID=${studyUID}&seriesUID=${seriesUID}&objectUID=${instanceUID}&contentType=application/dicom`;
  }

  // Check if Orthanc is available
  async checkOrthancAvailability(): Promise<boolean> {
    try {
      await orthancApi.get('/system');
      return true;
    } catch (error) {
      console.error('Orthanc server is not available:', error);
      return false;
    }
  }

  // Upload DICOM file to Orthanc
  async uploadDicomFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await orthancApi.post('/instances', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.ID;
  }
}

export const orthancService = new OrthancService();