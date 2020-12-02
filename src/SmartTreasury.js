import React, { useState } from "react";
import { Spacer } from "./Spacer";

import { Form, Card } from "react-bootstrap";

import { ADDRESSES } from "./constants";

import bactionsAbi from "./abi/bactions.json";

const getFunctionSigs = (abi) => {
  return abi
    .map((x) => {
      if (x.type !== "function") {
        return null;
      }
      if (x.stateMutability === "view") {
        return null;
      }
      if (x.stateMutability === "pure") {
        return null;
      }
      return `${x.name}(${x.inputs
        .map((y) => {
          if (y.name) {
            return `${y.type} ${y.name}`;
          }

          return y.type;
        })
        .join(",")})`;
    })
    .filter((x) => x !== null);
};

const bactionsFunctionSigs = getFunctionSigs(bactionsAbi);

function Encode({
  recipient,
  tokenAddress,
  poolAddress
}) {
  return (
    <>
      <Spacer y={15} />

      <Card>
        <Card.Body>
          <h4>Contract Interaction</h4>

          <Form>
            <Form.Group>
              <Form.Label>Recipient</Form.Label>
              <Form.Control type="text" value={recipient} disabled />
            </Form.Group>

            <Form.Group>
              <Form.Label>CRP/Pool (Controller) Address</Form.Label>
              <Form.Control type="text" value={tokenAddress} disabled />
            </Form.Group>

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
      recipient: ADDRESSES.BActions,
      poolAddress: ADDRESSES.SmartTreasury,
      tokenAddress: ADDRESSES.SmartTreasuryToken,
      functionSigs: bactionsFunctionSigs,
      abi: bactionsAbi,
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
