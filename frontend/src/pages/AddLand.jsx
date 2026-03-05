import { useState } from "react";
import { addLand } from "../api/api";

function AddLand() {

    const [form, setForm] = useState({
        ownerName: "",
        fatherName: "",
        dob: "",
        address: "",
        landArea: "",
        aadhar: "",
        pan: "",
        regNum: "",
        phone: "",
        email: "",
        coordinates: "",
        propertyValue: "",
        status: ""
    });

    const handleSubmit = async () => {

        const payload = {
            ...form,
            coordinates: form.coordinates
                .split(",")
                .map(Number)
        };

        const result = await addLand(payload);

        alert(result.message);

    };

    return (
        <div>

            <h1>Add Land</h1>

            <input
                placeholder="Owner Name"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            />

            <input
                placeholder="Father Name"
                value={form.fatherName}
                onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
            />

            <input
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />

            <input
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <input
                type="number"
                placeholder="Land Area"
                value={form.landArea}
                onChange={(e) =>
                    setForm({ ...form, landArea: Number(e.target.value) })
                }
            />

            <input
                type="number"
                placeholder="Aadhar"
                value={form.aadhar}
                onChange={(e) =>
                    setForm({ ...form, aadhar: Number(e.target.value) })
                }
            />

            <input
                type="number"
                placeholder="PAN"
                value={form.pan}
                onChange={(e) =>
                    setForm({ ...form, pan: Number(e.target.value) })
                }
            />

            <input
                type="number"
                placeholder="Registration Number"
                value={form.regNum}
                onChange={(e) =>
                    setForm({ ...form, regNum: Number(e.target.value) })
                }
            />

            <input
                type="number"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) =>
                    setForm({ ...form, phone: Number(e.target.value) })
                }
            />

            <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
                placeholder="Coordinates (example: 72.99,19.07)"
                value={form.coordinates}
                onChange={(e) =>
                    setForm({ ...form, coordinates: e.target.value })
                }
            />

            <input
                type="number"
                placeholder="Property Value"
                value={form.propertyValue}
                onChange={(e) =>
                    setForm({ ...form, propertyValue: Number(e.target.value) })
                }
            />

            <input
                type="number"
                placeholder="Status (100 or 101)"
                value={form.status}
                onChange={(e) =>
                    setForm({ ...form, status: Number(e.target.value) })
                }
            />

            <button onClick={handleSubmit}>Submit</button>

        </div>
    );
}

export default AddLand;