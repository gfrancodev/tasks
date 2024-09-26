KEY_NAME=task-jwt
KEY_DIR=keys

all: generate_keys

generate_keys:
	@mkdir -p $(KEY_DIR); \
	read -p "Enter passphrase: " PASSPHRASE; \
	echo "Generating RSA 4096 private key with passphrase..."; \
	openssl genpkey -algorithm RSA -out $(KEY_DIR)/$(KEY_NAME).pem -aes256 -pass pass:$$PASSPHRASE -pkeyopt rsa_keygen_bits:4096; \
	echo "Generating RSA 4096 public key..."; \
	openssl rsa -in $(KEY_DIR)/$(KEY_NAME).pem -pubout -out $(KEY_DIR)/$(KEY_NAME)_pub.pem -passin pass:$$PASSPHRASE; \
	echo "RSA 4096 key pair generated successfully!"; \
	echo "Private key: $(KEY_DIR)/$(KEY_NAME).pem"; \
	echo "Public key: $(KEY_DIR)/$(KEY_NAME)_pub.pem"

clean:
	@echo "Cleaning up generated keys in the keys directory..."
	rm -rf $(KEY_DIR)
	@echo "Cleaned up!"

help:
	@echo "Makefile for generating RSA 4096 key pair with passphrase"
	@echo ""
	@echo "Available targets:"
	@echo "  all              - Generate the RSA key pair (default target)"
	@echo "  generate_keys    - Generate RSA 4096 private key and public key"
	@echo "  clean            - Remove generated key files"