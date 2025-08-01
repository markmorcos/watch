import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css',
})
export class UploadComponent {
  http = inject(HttpClient);

  selectedFile = signal<File | undefined>(undefined);
  progress = signal(0);
  total = signal(0);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedFile.set(input.files[0]);
    }
  }

  async upload() {
    const file = this.selectedFile();
    if (!file) return;

    const chunkSize = 5 * 1024 * 1024;
    const fileId = uuidv4();
    const totalChunks = Math.ceil(file.size / chunkSize);
    this.progress.set(0);
    this.total.set(totalChunks);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('fileId', fileId);
      formData.append('index', i.toString());
      formData.append('total', totalChunks.toString());

      this.http
        .post(`${environment.uploadApiBaseUrl}/api/upload/chunk`, formData)
        .subscribe({
          next: () => this.progress.set(this.progress() + 1),
          error: (err) => console.error('Upload failed', err),
        });
    }
  }
}
