import { Container, Row, Col, Tabs, Tab } from "react-bootstrap";

import React, { useState } from "react";
import { Spacer } from "./Spacer";
import Encode from "./Encode";
import Decode from "./Decode";
import Hash from './Hash'

function App() {
  const [key, setKey] = useState("encode");

  return (
    <Container>
      <Row>
        <Col>
          <h2>Pickle Timelock Transaction Creation</h2>
        </Col>
      </Row>
      <Spacer y={15} />
      <Row>
        <Col>
          <Tabs
            variant="pills"
            activeKey={key}
            onSelect={(k) => setKey(k)}
          >
            <Tab eventKey="encode" title="Encode">
              <Encode />
            </Tab>
            <Tab eventKey="decode" title="Decode">
              <Decode />
            </Tab>
            <Tab eventKey="hash" title="Hash">
              <Hash />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
