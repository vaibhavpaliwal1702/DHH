import '../styles/AskDhh.css';
import { useState } from 'react';

function AskDHH() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="ask-dhh-wrapper">
            {isOpen && (
                <div className="ask-dhh-panel">
                    <div className="ask-dhh-header">
                        <h2 className="ask-dhh-title">Ask DHH</h2>
                        <button className="ask-dhh-close" onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    <div className="ask-dhh-messages"></div>
                    <div className="ask-dhh-input-row">
                        <input
                            type="text"
                            placeholder="Ask anything about DHH..."
                            className="ask-dhh-input"
                        />
                        <button className="ask-dhh-send">Send</button>
                    </div>
                </div>
            )}
            <button className="ask-dhh-trigger" onClick={() => setIsOpen(!isOpen)}>
                Ask DHH
            </button>
        </div>
    );
}

export default AskDHH;