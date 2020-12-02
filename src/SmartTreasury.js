import React, { useState } from "react";
import { Spacer } from "./Spacer";

import { Form, Card } from "react-bootstrap";

import { ADDRESSES } from "./constants";

import crpAbi from "./abi/crp.json";

function Encode({ tokenAddress, poolAddress }) {
  return (
    <>
      <Spacer y={15} />

      <Card>
        <Card.Body>
          <h4>Contract Interaction</h4>

          <Form>
            <Card>
              <Card.Body>
                <Form.Group>
                  <Form.Label>CRP/Pool (Controller) Address</Form.Label>
                  <Form.Control type="text" value={tokenAddress} disabled />
                </Form.Group>

                <Form.Group>
                  <Form.Label>ABI</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows="3"
                    value={JSON.stringify(crpAbi)}
                    disabled
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            <br />

            <Form.Group>
              <Form.Label>Pool (Swap) Address</Form.Label>
              <Form.Control type="text" value={poolAddress} disabled />
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}

function EncodeSelector() {
  const contracts = {
    "Pickle Smart Treasury (90 PICKLE / 10 WETH)": {
      poolAddress: ADDRESSES.SmartTreasury,
      tokenAddress: ADDRESSES.SmartTreasuryToken
    },
  };

  const [selectedContract, setSelectedContract] = useState(
    contracts["Pickle Smart Treasury (90 PICKLE / 10 WETH)"]
  );

  return (
    <>
      <Spacer y={20} />

      <Form.Group>
        <Form.Label>
          <h3>Contract</h3>
        </Form.Label>
        <Form.Control
          as="select"
          onChange={(e) => {
            setSelectedContract(contracts[e.target.value]);
          }}
        >
          {Object.keys(contracts).map((x) => (
            <option key={x}>{x}</option>
          ))}
        </Form.Control>
      </Form.Group>

      <Encode {...selectedContract} />
    </>
  );
}

export default EncodeSelector;
