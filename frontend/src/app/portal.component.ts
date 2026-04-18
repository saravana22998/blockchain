import { Component, HostListener, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./app.component.css']
})
export class PortalComponent {
  formData = {
    id: '',
    recipientName: '',
    courseName: '',
    issuedOn: ''
  };

  isCreating = false;
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient) {
    this.formData.id = `CERT-${Date.now()}`;
    this.formData.issuedOn = new Date().toISOString().split('T')[0];
  }

  generateCertificate() {
    this.isCreating = true;
    this.successMessage = 'Wrapping Certificate...';
    this.errorMessage = '';

    const payload = {
      id: this.formData.id,
      recipientName: this.formData.recipientName,
      courseName: this.formData.courseName,
      issuedOn: new Date(this.formData.issuedOn).toISOString()
    };

    this.http.post<any>('/api/cert/create', payload).subscribe(
      (res: any) => {
        if(res.success && res.certificate) {
          const merkleRoot = res.certificate.signature?.merkleRoot || res.certificate.signature?.targetHash;
          this.successMessage = 'Certificate Wrapped! Issuing to Blockchain (this may take a few seconds)...';
          
          this.http.post<any>('/api/cert/issue', { merkleRoot }).subscribe(
            (issueRes: any) => {
               this.isCreating = false;
               if(issueRes.success) {
                 this.successMessage = `Certificate Issued! TxHash: ${issueRes.txHash}. Downloading JSON...`;
                 this.downloadJson(res.certificate, `${payload.recipientName}-certificate.json`);
               } else {
                 this.errorMessage = 'Failed to issue certificate to blockchain.';
               }
            },
            (issueErr: any) => {
               this.isCreating = false;
               this.errorMessage = 'Failed to issue certificate to blockchain. See console.';
               console.error(issueErr);
            }
          );
        } else {
          this.isCreating = false;
        }
      },
      (err: any) => {
        this.isCreating = false;
        this.errorMessage = 'Failed to generate certificate. Ensure backend is running.';
        console.error(err);
      }
    );
  }

  private downloadJson(data: any, filename: string) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(url);
  }
}
