import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { JournalProvider } from "./lib/journalStore";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<JournalProvider>
			<App />
		</JournalProvider>
	</React.StrictMode>,
);
