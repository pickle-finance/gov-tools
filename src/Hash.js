import React, { useState } from "react";
import { ethers } from "ethers";
import { Card, Button, Form } from "react-bootstrap";
import { Spacer } from "./Spacer";

function Hash() {
  const [target, setTarget] = useState("");
  const [value, setValue] = useState("");
  const [signature, setSignature] = useState("");
  const [data, setData] = useState("");
  const [eta, setEta] = useState("");

  const [txHash, setTxHash] = useState("");

  return (
    <>
      <Spacer y={15} />

      <Card>
        <Card.Body>
          <Form>
            <Form.Group>
              <Form.Label>Target</Form.Label>
              <Form.Control
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Value</Form.Label>
              <Form.Control
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Signature</Form.Label>
              <Form.Control
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Data</Form.Label>
              <Form.Control
                type="text"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Eta</Form.Label>
              <Form.Control
                type="text"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
              />
            </Form.Group>

            <Button
              onClick={(e) => {
                e.preventDefault();

                let txHash;

                try {
                  txHash = ethers.utils.defaultAbiCoder.encode(
                    ["address", "uint256", "string", "bytes", "uint"],
                    [target, value, signature, data, eta]
                  );
                  txHash = ethers.utils.keccak256(txHash)
                } catch (e) {
                  txHash = e.toString();
                }

                setTxHash(txHash);
              }}
            >
              Get Tx Hash
            </Button>

            <Spacer y={15} />

            <Form.Group>{txHash.length > 0 && txHash}</Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}

export default Hash;
