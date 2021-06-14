"""Tool to create a key-pair for interacting with the Oasis parcel API."""

from absl import app
from absl import flags
from jwcrypto import jwk
import uuid

_FLAG_KEY_ID = flags.DEFINE_string('key_id',
                                   default=None,
                                   help='Key identifier.')
_FLAG_KEY_OUTPUT_FILE = flags.DEFINE_string('output_path',
                                            default=None,
                                            help='Output file path.')


def generate(key_id: str) -> jwk.JWK:
  """Generate a key pair.

  Args:
    key_id: Optional key identifier, uses random id if not provided.

  Returns:
    The generated key.
  """
  return jwk.JWK.generate(alg='ES256',
                          kty='EC',
                          crv='P-256',
                          kid=key_id or str(uuid.uuid1()),
                          use='sig')


def main(_):
  key = generate(key_id=_FLAG_KEY_ID.value)

  if _FLAG_KEY_OUTPUT_FILE.value:
    with open(_FLAG_KEY_OUTPUT_FILE.value, 'w') as f:
      f.write(key.export_private())

  # Output key details.
  print(key.export_public())
  print(key.export_private())


if __name__ == '__main__':
  app.run(main)
