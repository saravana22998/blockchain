import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-renderer',
  templateUrl: './renderer.component.html',
  styleUrls: ['./app.component.css']
})
export class RendererComponent implements OnInit {
  certificateData: any = null;

  ngOnInit() {
    // When the app starts, tell OpenCerts your template is ready
    window.parent.postMessage({
      type: "UPDATE_TEMPLATES",
      payload: [{ id: "certificate", label: "Official Certificate" }]
    }, "*");
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    const action = event.data;

    if (action.type === "RENDER_DOCUMENT") {
      this.certificateData = action.payload.document;
      
      setTimeout(() => {
        window.parent.postMessage({
          type: "UPDATE_HEIGHT",
          payload: document.documentElement.scrollHeight
        }, "*");
      }, 100);
    }
  }
}
