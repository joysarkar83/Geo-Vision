function TextField({
  label,
  caption,
  type = "text",
  className = "",
  ...inputProps
}) {
  return (
    <div className="field">
      {label && (
        <label className="field-label">
          {label}{" "}
          {caption && (
            <span>
              &mdash; {caption}
            </span>
          )}
        </label>
      )}
      <input className={`field-input ${className}`} type={type} {...inputProps} />
    </div>
  );
}

export default TextField;

